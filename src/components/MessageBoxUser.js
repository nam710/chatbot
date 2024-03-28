import { StyleSheet, Text, View } from "react-native";
import React from "react";

const messageBoxUser = ({content}) => {
  return (
    <View style={styles.messageBox}>
      <Text style={{ fontWeight: "bold" }}>You:</Text>
      <Text>
        {content}
      </Text>
    </View>
  );
};

export default messageBoxUser;

const styles = StyleSheet.create({
  messageBox: {
    maxWidht: "80%",
    minWidth: "40%",
    backgroundColor: "oldlace",
    alignItems: "flex-start",
    alignSelf:'flex-end',    
    padding: 10,
    borderRadius: 10,
  },
});
