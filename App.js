import { StatusBar } from "expo-status-bar";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  Button,
  TouchableOpacity,
  FlatList,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MessageBoxBot from "./src/components/MessageBoxBot";
import MessageBoxUser from "./src/components/MessageBoxUser";
import messageData from "./src/data/messageData";
import knowledgeBase from "./src/data/knowledgeBase";
import { useState } from "react";
import axios from "axios";

export default function App() {
  const [userMessages, setUserMessages] = useState(messageData);
  const [userInput, setUserInput] = useState("");
  const [learnON, setLearnON] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  const [userQuestion, setUserQuestion] = useState("");

  const botDefaultResponse = {
    role: "assistant",
    content:
      'I do not know the answer to this, please fill my knowledge base by giving me its answer or type "/skip".',
  };
  const botLearnedResponse = {
    role: "assistant",
    content:
      "Thankyou, I learned this response and added it to my knowledge base.",
  };

  const botResponse = (userInput, updatedMessages) => {
    let bestMatch = "";
    let bestMatchPercentage = 0;

    knowledgeBase.forEach((data) => {
      // Calculate the similarity score between the userInput and the current element in the dataArray
      const similarity = calculateStringSimilarity(userInput, data);
      if (similarity > bestMatchPercentage) {
        bestMatchPercentage = similarity;
        bestMatch = data.response;
      }
    });

    const newBotEntry = {
      role: "assistant",
      content: bestMatch,
    };
    if (userInput == "/skip") {
      setLearnON(false);
      setUserMessages([
        ...updatedMessages,
        { role: "assistant", content: "Ask me anything!" },
      ]);
      setUserInput("");
      return;
    }
    if (userInput != "" && userInput != "/clear") {
      if (knowledgeBase.length != 0 && bestMatchPercentage >= 0.6 && !learnON) {
        setUserMessages([...updatedMessages, newBotEntry]);
      } else {
        if (learnON) {
          //fill knowledge base
          const newKnowledge = {
            question: userQuestion,
            response: userInput,
          };
          setUserMessages([...updatedMessages, botLearnedResponse]);
          setLearnON(false);
        } else {
          setUserMessages([...updatedMessages, botDefaultResponse]);
          setLearnON(true);
        }
      }
      setUserInput(""); // Clear the input field after submitting
    }
  };
  const calculateStringSimilarity = (string1, string2) => {
    const len1 = string1.length;
    const len2 = string2.question.length;
    const maxLength = Math.max(len1, len2);
    let matchCount = 0;

    for (let i = 0; i < Math.min(len1, len2); i++) {
      if (string1[i] === string2.question[i]) {
        matchCount++;
      }
    }

    return maxLength === 0 ? 0 : matchCount / maxLength; // Return the similarity score
  };

  const handleSubmit = () => {
    if (userInput.trim() !== "") {
      if (isEnabled) {
        (async () => {
          if (userInput == "/clear") {
            setUserMessages(messageData);
            setUserInput("");
          } else {
            const newUserEntry = {
              role: "user",
              content: userInput,
            };
            setUserInput("");

            const apiKey =
              "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";
            try {
              const client = axios.create({
                headers: {
                  Authorization: "Bearer " + apiKey,
                },
              });

              console.log(userMessages);
              const result = await client.post(
                "https://api.openai.com/v1/chat/completions",
                {
                  messages: [
                    {
                      role: "system",
                      content:
                        "You are a travel assistant that will tell how to travel to anywhere from india.",
                    },
                    ...userMessages,
                    newUserEntry,
                  ],
                  model: "gpt-3.5-turbo",
                  max_tokens: 1000,
                  temperature: 0.8,
                }
              );
              setUserMessages((userMessages) => [
                ...userMessages,
                newUserEntry,
                {
                  role: "assistant",
                  content: result.data.choices[0].message.content,
                },
              ]);
            } catch (error) {
              console.error("Error fetching AI response:", error);
            }
          }
        })();
      } else {
        const newUserEntry = {
          role: "user",
          content: userInput,
        };
        if (userInput == "/clear") {
          setUserMessages(messageData);
        } else {
          const updatedMessages = [...userMessages, newUserEntry];
          setUserMessages(updatedMessages);
          botResponse(userInput.toLowerCase(), updatedMessages);
        }
        setUserInput(""); // Clear the input field after submitting
        if (!learnON) {
          setUserQuestion(userInput.toLowerCase());
        }
      }
    }
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.GPTenabler}>
          <Text
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: 16,
              textAlignVertical: "center",
            }}
          >
            Enable GPT 3.5
          </Text>
          <Switch
            trackColor={{ false: "whitesmoke", true: "whitesmoke" }}
            thumbColor={isEnabled ? "limegreen" : "red"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
        <FlatList
          data={userMessages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => {
            return item.role === "assistant" ? (
              <MessageBoxBot content={item.content} />
            ) : (
              <MessageBoxUser content={item.content} />
            );
          }}
          contentContainerStyle={{ gap: 5 }}
        />

        <View style={{ flexDirection: "row" }}>
          <View style={styles.messageBox}>
            <TextInput
              placeholder="Your prompt here..."
              value={userInput}
              onChangeText={(text) => setUserInput(text)}
            ></TextInput>
          </View>
          <TouchableOpacity
            onPress={handleSubmit}
            style={{
              justifyContent: "center",
              alignItems: "center",
              padding: 10,
              backgroundColor: "palegreen",
              borderTopEndRadius: 10,
              borderBottomEndRadius: 10,
              borderWidth: 1,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>SUBMIT</Text>
          </TouchableOpacity>
        </View>
      </View>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginVertical: 18,
    justifyContent: "space-between",
    gap: 5,
  },
  messageBox: {
    backgroundColor: "beige",
    // marginBottom: 20,
    padding: 10,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    flex: 1,
    borderWidth: 1,
    borderRightWidth: 0,
    // alignSelf: "flex-en",
    maxWidth: "100%",
  },
  GPTenabler: {
    width: "100%",
    backgroundColor: "mediumaquamarine",
    padding: 10,
    justifyContent: "space-between",
    alignSelf: "center",
    borderRadius: 15,
    flexDirection: "row",
  },
});
