import { StyleSheet, Text, View } from "react-native";
import React from "react";

const messageBoxBot = ({content}) => {
  return (
    
    <View style={styles.messageBox}>
      <Text style={{ fontWeight: "bold" }}>Bot:</Text>
      <Text>
        {content}
      </Text>
    </View>
  );
};

export default messageBoxBot;

const styles = StyleSheet.create({
  messageBox: {
    maxWidht: "70%",
    minWidth: "40%",
    backgroundColor: "mistyrose",
    alignItems: "flex-start",
    alignSelf:'flex-start',
    padding: 10,
    borderRadius: 10,
  },
});
