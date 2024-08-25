import React, { useState } from "react";
import "./TransliterationInput.css";

const TransliterationInput = () => {
  const [language, setLanguage] = useState("hi"); // default to Hindi
  const [inputText, setInputText] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleInputChange = async (e) => {
    const text = e.target.value;
    setInputText(text);

    if (text.endsWith(" ")) {
      const words = text.trim().split(" ");
      const lastWord = words.pop();

      const transliteratedSuggestions = await fetchTransliteration(
        lastWord,
        language
      );
      if (transliteratedSuggestions.length > 0) {
        const transliteratedWord = transliteratedSuggestions[0];
        const newText = [...words, transliteratedWord].join(" ") + " ";
        setInputText(newText);
        setSuggestions([]);
      }
    } else {
      const words = text.split(" ");
      const lastWord = words[words.length - 1];
      const transliteratedSuggestions = await fetchTransliteration(
        lastWord,
        language
      );
      setSuggestions(transliteratedSuggestions);
    }
  };

  const fetchTransliteration = async (text, lang) => {
    try {
      const response = await fetch("https://inputtools.google.com/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: new URLSearchParams({
          text: text,
          itc: `${lang}-t-i0-und`,
          num: "5",
          cp: "0",
          cs: "1",
          ie: "utf-8",
          oe: "utf-8",
          app: "demopage",
        }),
      });

      const data = await response.json();
      if (data && data[1] && data[1][0] && data[1][0][1]) {
        return data[1][0][1];
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error fetching transliteration:", error);
      return [];
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const words = inputText.split(" ");
    words[words.length - 1] = suggestion;
    setInputText(words.join(" ") + " ");
    setSuggestions([]);
  };

  const handleClearInput = () => {
    setInputText('');
    setSuggestions([]);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background:'#99efce',
        position:'relative'
      }}
    >
      <h1>Transliteration</h1>
      <label style={{fontSize:'1.2rem'}}>Select a language:</label>
      <select value={language} onChange={handleLanguageChange}>
        <option value="hi">Hindi</option>
        <option value="kn">Kannada</option>
        <option value="ml">Malayalam</option>
        <option value="or">Odia</option>
        <option value="te">Telugu</option>
      </select>
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Type here..."
          // style={styles.input}
        />
        {inputText && (
          <button onClick={handleClearInput} style={styles.clearButton}>
            &times;
          </button>
        )}
      </div>
      {suggestions.length > 0 && (
        <ul style={{position:'absolute', bottom:'12rem'}}  className="suggestions">
          {suggestions.map((suggestion, index) => (
            <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const styles={
  clearButton: {
    position: 'absolute',
    right: '10px',

    top:'8px',
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#999',
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
}

export default TransliterationInput;
