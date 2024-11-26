import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GiftedChat } from "react-native-gifted-chat";
import io from "socket.io-client";

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Kết nối tới socket.io server
  const socket = io("http://localhost:8080");

  useEffect(() => {
    socket.on("receive_message", (message) => {
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, {
          _id: Math.random().toString(),
          text: message.text,
          createdAt: new Date(),
          user: { _id: 2, name: "Server" },
        })
      );
    });

    return () => {
      socket.off("receive_message");
    };
  }, [socket]);

  const handleSend = (newMessages = []) => {
    const message = newMessages[0];
    socket.emit("send_message", { text: message.text });
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );
  };

  // Vị trí mặc định của chatbox
  const { width } = Dimensions.get("window");
  const position = useRef(
    new Animated.ValueXY({ x: width - 80, y: Dimensions.get("window").height - 120 })
  ).current;

  // Xử lý kéo thả
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => position.flattenOffset(),
    })
  ).current;

  return (
    <SafeAreaProvider style={{position: 'absolute'}}>
      <Animated.View
        style={[
          styles.container,
          { transform: position.getTranslateTransform() },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Biểu tượng chat nhỏ gọn */}
        {!isOpen && (
          <TouchableOpacity
            style={styles.chatIcon}
            onPress={() => setIsOpen(true)}
          >
            <Text style={styles.chatIconText}>💬</Text>
          </TouchableOpacity>
        )}

        {/* Chatbox mở rộng */}
        {isOpen && (
          <View style={styles.chatContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsOpen(false)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <GiftedChat
              messages={messages}
              onSend={(messages) => handleSend(messages)}
              user={{ _id: 1, name: "User" }}
            />
          </View>
        )}
      </Animated.View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 10,  // Giữ chatbox ở bên phải màn hình
    bottom: 100,  // Vị trí cách đáy một khoảng nhỏ
    zIndex: 1000,
  },
  chatIcon: {
    backgroundColor: "#007bff",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
  },
  chatIconText: {
    color: "#fff",
    fontSize: 24,
  },
  chatContainer: {
    width: 320,
    height: 420,
    backgroundColor: "#fff",
    borderRadius: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    overflow: "hidden",
  },
  closeButton: {
    backgroundColor: "#ff4d4f",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 10,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default ChatBox;
