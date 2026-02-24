import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// 🌟 さっき作った「秘密の鍵」のファイルを読み込む！
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

const API_URL = "https://mental-api-e4ab.onrender.com/api/mental";
// const API_URL = "https://mental-api-e4ab.onrender.com/api/mental";
export default function App() {
  // 🌟 Firebaseが管理する「本物のユーザー情報」を入れる箱
  const [user, setUser] = useState<any>(null);

  // ログイン画面用の入力欄
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [mood, setMood] = useState(3);
  const [text, setText] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🌟 アプリを開いた時に「誰がログインしているか」をFirebaseに確認する
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // ログインしていればユーザー情報が入り、していなければ null になる
    });
    return () => unsubscribe();
  }, []);

  // ユーザー情報が変わった時（ログインした時）に履歴を取得する
  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  // 🌟 新規登録（アカウント作成）の処理
  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("成功", "アカウントが作成されたにゃ！");
    } catch (error: any) {
      Alert.alert("エラー", error.message);
    }
  };

  // 🌟 ログインの処理
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("成功", "ログインしたにゃ！");
    } catch (error: any) {
      Alert.alert("エラー", error.message);
    }
  };

  // 🌟 ログアウトの処理
  const handleLogout = async () => {
    await signOut(auth);
  };

  // 履歴取得（UIDを本物に変えました！）
  const fetchHistory = async () => {
    if (!user) return;
    try {
      // 🌟 TEMP_UID ではなく、Firebaseの本物の user.uid を使う！
      const res = await fetch(`${API_URL}/history?uid=${user.uid}`);
      const data = await res.json();
      setHistory(data);
    } catch (error) {
      console.log("History Error:", error);
    }
  };

  // 気分送信（UIDを本物に変えました！）
  const handleCheckin = async () => {
    if (!user) return;
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch(`${API_URL}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 🌟 TEMP_UID ではなく、Firebaseの本物の user.uid を送る！
        body: JSON.stringify({ uid: user.uid, mood_score: mood, text: text }),
      });
      const data = await res.json();
      setResponse(data.message);
      setText("");
      fetchHistory();
    } catch (error) {
      Alert.alert("エラー", "送信に失敗したにゃ...");
    } finally {
      setLoading(false);
    }
  };

  const getMoodIcon = (score: number) => {
    const icons: {[key: number]: string} = { 1: '😫', 2: '😢', 3: '😐', 4: '🙂', 5: '😆' };
    return icons[score] || '😐';
  };

  // 🚪 ログイン画面の部品（本物のメール/パスワード入力に変わりました！）
  if (!user) {
    return (
      <SafeAreaView style={styles.loginContainer}>
        <Text style={styles.loginTitle}>🐾 ネコメンタル</Text>
        <Text style={styles.loginSubtitle}>あなたの心に寄り添う、猫のカウンセラー</Text>
        
        <View style={styles.loginCard}>
          <Text style={styles.loginPrompt}>ログインしてはじめるにゃ</Text>
          
          <TextInput
            style={styles.authInput}
            placeholder="メールアドレス"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.authInput}
            placeholder="パスワード (6文字以上)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginBtnText}>ログイン</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.signupBtn} onPress={handleSignUp}>
            <Text style={styles.signupBtnText}>新しく登録する</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 📖 いつもの記録画面の部品
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>🐾 ネコメンタル</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>🚪 出る</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>今日もお疲れ様！えらいにゃ〜！</Text>
          <View style={styles.moodContainer}>
            {[1, 2, 3, 4, 5].map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setMood(m)}
                style={[styles.moodBtn, mood === m && styles.moodBtnSelected]}
              >
                <Text style={styles.moodText}>{getMoodIcon(m)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="今日あったことを教えてにゃ🐾"
            placeholderTextColor="#aaa"
            value={text}
            onChangeText={setText}
            multiline
          />

          <TouchableOpacity
            style={[styles.sendBtn, loading && styles.sendBtnDisabled]}
            onPress={handleCheckin}
            disabled={loading}
          >
            <Text style={styles.sendBtnText}>
              {loading ? "考え中にゃ..." : "送信するにゃ！"}
            </Text>
          </TouchableOpacity>

          {response && (
            <View style={styles.responseBox}>
              <Text style={styles.responseLabel}>🐱 猫からの返事</Text>
              <Text style={styles.responseText}>{response}</Text>
            </View>
          )}
        </View>

        <Text style={styles.historyTitle}>📖 過去のきろく</Text>
        {/* {history.map((item, index) => ( */}
        {Array.isArray(history) && history.map((item, index) => (
          <View key={index} style={styles.historyItem}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyDate}>
                {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </Text>
              <Text style={styles.historyMood}>{getMoodIcon(item.mood_score || item.mood)}</Text>
            </View>
            {item.text ? <Text style={styles.historyText}>{item.text}</Text> : null}
            <Text style={styles.historyResponse}>🐱 {item.ai_response}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// 🎨 デザイン設定（ログイン画面用の入力枠を追加しました）
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF0F5' },
  loginContainer: { flex: 1, backgroundColor: '#FFF0F5', justifyContent: 'center', alignItems: 'center', padding: 20 },
  loginTitle: { fontSize: 36, fontWeight: '800', color: '#FF8DA1', marginBottom: 10 },
  loginSubtitle: { fontSize: 16, color: '#888', marginBottom: 40, fontWeight: '600' },
  loginCard: { backgroundColor: 'white', padding: 30, borderRadius: 20, width: '100%', shadowColor: '#FFB6C1', shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  loginPrompt: { fontSize: 18, fontWeight: 'bold', color: '#555', marginBottom: 25, textAlign: 'center' },
  authInput: { backgroundColor: '#FAFAFA', borderRadius: 10, padding: 15, marginBottom: 15, fontSize: 16, borderColor: '#EEE', borderWidth: 1 },
  loginBtn: { backgroundColor: '#FF9EAA', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  loginBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  signupBtn: { backgroundColor: 'transparent', padding: 15, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#FF9EAA' },
  signupBtnText: { color: '#FF9EAA', fontSize: 16, fontWeight: 'bold' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  logoutText: { fontSize: 16, color: '#FF8DA1', fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#FF8DA1' },
  card: { backgroundColor: 'white', padding: 25, borderRadius: 20, marginBottom: 25, shadowColor: '#FFB6C1', shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  label: { fontSize: 18, marginBottom: 20, textAlign: 'center', color: '#666', fontWeight: '600' },
  moodContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  moodBtn: { padding: 12, borderRadius: 25, backgroundColor: '#F8F8F8' },
  moodBtnSelected: { backgroundColor: '#FFE4E1', transform: [{ scale: 1.15 }] },
  moodText: { fontSize: 32 },
  input: { backgroundColor: '#FAFAFA', borderRadius: 15, padding: 15, height: 100, textAlignVertical: 'top', marginBottom: 20, fontSize: 16, borderColor: '#EEE', borderWidth: 1 },
  sendBtn: { backgroundColor: '#FF9EAA', padding: 16, borderRadius: 15, alignItems: 'center', shadowColor: '#FF9EAA', shadowOpacity: 0.4, shadowRadius: 5 },
  sendBtnDisabled: { backgroundColor: '#E0E0E0', shadowOpacity: 0 },
  sendBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  responseBox: { marginTop: 25, backgroundColor: '#FFF5EE', padding: 18, borderRadius: 15, borderWidth: 1, borderColor: '#FFE4E1' },
  responseLabel: { fontWeight: 'bold', color: '#FF8DA1', marginBottom: 8, fontSize: 16 },
  responseText: { color: '#555', lineHeight: 24, fontSize: 15 },
  historyTitle: { fontSize: 20, fontWeight: 'bold', color: '#888', marginBottom: 15, marginLeft: 5 },
  historyItem: { backgroundColor: 'white', padding: 18, borderRadius: 15, marginBottom: 12, borderLeftWidth: 5, borderLeftColor: '#FFB6C1', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  historyDate: { color: '#AAA', fontSize: 12 },
  historyMood: { fontSize: 16 },
  historyText: { fontSize: 15, color: '#444', marginBottom: 8, lineHeight: 20 },
  historyResponse: { fontSize: 14, color: '#777', fontStyle: 'italic' },
});