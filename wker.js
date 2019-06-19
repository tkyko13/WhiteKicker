"use strict";

const axios = require("axios");
const fs = require("fs");
const readline = require("readline");

// google translate api
const TRANSLATE_API_KEY = "YOUR_KEY";

// GET通信
// let uri = "https://qiita.com/api/v2/tags";
const baseURL = "http://www.google.com/transliterate";
const traBaseURL = "https://translation.googleapis.com/language/translate/v2";
const e2kBaseURL = "https://www.sljfaq.org/cgi/e2k.cgi";

// 与えられた文字列に最低2文字以下でカンマ区切りするパターンを全て返す
// ex こんにちは -> ['こん,にちは', 'こんに,ちは']
// 現在ランダム
function spliceComma(text) {
  // 4文字未満場合はそのまま返す
  if (text.length < 4) {
    return text;
  }
  let retArr = [];
  // for (let i = 2; i < text.length - 1; i++) {
  //   retArr.push(text.slice(0, i) + "," + text.slice(i));
  // }
  // 現在ランダムで一つだけ
  let i = Math.floor(Math.random() * (text.length - 3) + 2);
  retArr.push(text.slice(0, i) + "," + text.slice(i));
  return retArr;
}

// 文字列に漢字が含まれているかの判定
// https://pisuke-code.com/js-check-hira-kana-kanzi/
// 全大文字英語も入っているらしい...
function judgeKanji(text) {
  let regexp = /([\u{3005}\u{3007}\u{303b}\u{3400}-\u{9FFF}\u{F900}-\u{FAFF}\u{20000}-\u{2FFFF}][\u{E0100}-\u{E01EF}\u{FE00}-\u{FE02}]?)/mu;
  return regexp.test(text);
}

// かなから漢字取得，配列で返す
// googleAPIでは漢字以外も返ってくるが，第二引数をtrueにすることで漢字のみ返す
async function getKanjis(kana, kanjiOnly) {
  const res = await axios.get(baseURL, {
    method: "json",
    params: {
      langpair: "ja-Hira|ja",
      text: kana
    }
  });
  if (res && res.data) {
    // console.log(res.data);
    if (kanjiOnly == true) {
      // return res.data.forEach(ele => ele[1].filter(ele2 => judgeKanji(ele2)));

      for (let i = 0; i < res.data.length; i++) {
        for (let j = 0; j < res.data[i][1].length; j++) {
          if (judgeKanji(res.data[i][1][j]) == false) {
            res.data[i][1].splice(j, 1);
          }
        }
      }
      return res.data;
    } else {
      return res.data;
    }
  } else {
    return null; //error
  }
}

// 英語変換
async function getEnglish(word) {
  const res = await axios.get(traBaseURL, {
    method: "post",
    params: {
      q: word,
      target: "en",
      key: TRANSLATE_API_KEY
    }
  });
  return res.data.data.translations[0].translatedText;
}

// 英語からカタカナに変換
async function getKatakana(en) {
  const e2kRes = await axios.get(e2kBaseURL, {
    method: "get",
    params: {
      o: "json",
      lang: "ja",
      word: en
    }
  });
  let ret = "";
  for (let i = 0; i < e2kRes.data.words.length; i++) {
    ret += e2kRes.data.words[i].j_pron_only;
  }
  return ret;
}
// const stream = fs.createReadStream("bep-eng.dic", "utf8");
// const reader = readline.createInterface({ input: stream });
// function getKatakana(en) {
//   return new Promise(function(resolve, reject) {
//     en = en.toUpperCase();
//     reader.on("line", data => {
//       let arr = data.split(" ");
//       if (arr[0] == en) {
//         resolve(arr[1]);
//       }
//     });
//   });
// }

/*
 main関数
*/
async function main(text) {
  // console.log(text);

  // try {
  // カンマ区切りのパターン取得
  let cammaArr = spliceComma(text);
  console.log(cammaArr);

  // 現在はカンマ区切り位置はランダムなので，1パターンだけ漢字取得
  const kanjiArr = await getKanjis(cammaArr[0], true);
  console.log(kanjiArr);

  // 一旦漢字の段階でランダムで最終表示のワードを決めちゃう
  let kanjiDecArr = [];
  for (let i = 0; i < kanjiArr.length; i++) {
    let ind = Math.floor(Math.random() * kanjiArr[i][1].length);
    kanjiDecArr.push(kanjiArr[i][1][ind]);
  }
  console.log(kanjiDecArr);

  // 漢字を全て英語変換
  // 漢字変換APIからもらうデータの構造と同じに
  let enArr = [];
  for (let i = 0; i < kanjiDecArr.length; i++) {
    enArr.push(await getEnglish(kanjiDecArr[i]));
  }
  console.log(enArr);

  // 英語からカタカナ変換
  let katakanaArr = [];
  for (let i = 0; i < enArr.length; i++) {
    katakanaArr.push(await getKatakana(enArr[i]));
  }
  console.log(katakanaArr);

  // ・をつけてかっこよく，文字列に
  let wkWord = katakanaArr.join("・");
  console.log(wkWord);
  // process.stdout.write(wkWord);

  return {
    kanji: kanjiDecArr,
    en: enArr,
    katakana: katakanaArr,
    text: wkWord
  };
  // } catch (error) {
  //   const { status, statusText } = error.response;
  //   console.log(`Error! HTTP Status: ${status} ${statusText}`);
  //   console.log(error);
  //   return error;
  // }
}

module.exports = main;
