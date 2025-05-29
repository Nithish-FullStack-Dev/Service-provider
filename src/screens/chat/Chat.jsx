import {useRoute} from '@react-navigation/native';
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import {ref, onValue, push} from 'firebase/database';
import {db} from '../../config/firebaseConfig';

const AdminChat = () => {
  const {
    params: {adminId, userId},
  } = useRoute();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef();

  useEffect(() => {
    const chatRef = ref(db, `chats/${getChatId(userId, adminId)}`);

    const unsubscribe = onValue(chatRef, snapshot => {
      const data = snapshot.val() || {};
      const msgs = Object.keys(data).map(key => ({
        id: key,
        ...data[key],
      }));
      msgs.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [userId, adminId]);

  const getChatId = (a, b) => [a, b].sort().join('_');

  const sendMessage = () => {
    if (inputText.trim() === '') return;
    const chatRef = ref(db, `chats/${getChatId(userId, adminId)}`);

    const newMsg = {
      text: inputText.trim(),
      sender: adminId, // adminId as sender here
      timestamp: Date.now(),
    };

    push(chatRef, newMsg);
    setInputText('');
  };

  const formatTime = ts => {
    const date = new Date(ts);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    return `${h}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const renderMessage = ({item}) => {
    const isAdmin =
      item.sender?.toString().trim() === adminId?.toString().trim();

    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: isAdmin ? 'flex-end' : 'flex-start',
          marginVertical: 5,
          paddingHorizontal: 10,
        }}>
        <View
          style={[
            styles.messageContainer,
            {
              backgroundColor: isAdmin ? '#DCF8C6' : '#ECECEC',
              borderBottomRightRadius: isAdmin ? 0 : 10,
              borderBottomLeftRadius: isAdmin ? 10 : 0,
            },
          ]}>
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{flex: 1}}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{padding: 10}}
        onContentSizeChange={() =>
          flatListRef.current.scrollToEnd({animated: true})
        }
        onLayout={() => flatListRef.current.scrollToEnd({animated: true})}
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message"
          style={styles.input}
          multiline={true}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={{color: '#fff', fontWeight: 'bold'}}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: '70%',
    padding: 10,
    borderRadius: 10,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  messageTime: {
    fontSize: 10,
    color: 'gray',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0084FF',
    borderRadius: 20,
    paddingHorizontal: 20,
    marginLeft: 10,
  },
});

export default AdminChat;
