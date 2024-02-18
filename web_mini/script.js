let state = {
    gameOver: false,
    targetWord: '',
    currentGuess: '',
    guesses: [],
    currentGuessIndex: 0
};


function _redrawGuessArea() {
    let area = document.querySelector(".guess-area");
    area.innerHTML = "";

    let row = document.createElement("div");
    row.classList.add("guess-row");
   
    for (let i = 0; i < state.currentGuess.length; i++) {
        let div = document.createElement("div");
        div.classList.add("guess-slot");
        div.innerText = state.currentGuess.charAt(i);
     
        row.append(div);
    }

   // blanks
    for (let i = state.currentGuess.length; i < 6; i++) {
        let div = document.createElement("div");
        div.classList.add("guess-slot");
        row.append(div);
    }

    area.append(row);
}

function _redrawGuessesArea() {
    let area = document.querySelector(".guesses-area");
    area.innerHTML = "";

    for (let g = 0; g < state.guesses.length; g++) {
        let row = document.createElement("div");
        row.classList.add("guess-row");
   
        for (let i = 0; i < 6; i++) {
            let div = document.createElement("div");
            div.classList.add("guess-slot");
            div.innerText = state.guesses[g].charAt(i);
            
            row.append(div);
        }

        area.append(row);
    }

    for (let i = state.guesses.length; i < 6; i++) {
        let row = document.createElement("div");
        row.classList.add("guess-row");

        for (let k = 0; k < 6; k++) {
            let div = document.createElement("div");
            div.classList.add("guess-slot");
            row.append(div);
        }

        area.append(row);
    }
}

function _updateGuessesArea (letterStatus) {
    let guessSlots = document.querySelectorAll(".guess-area .guess-slot");
    guessSlots.forEach((item, index) => {
        item.innerText = state.currentGuess.charAt(index);
    });

    let guessesRows = document.querySelectorAll(".guesses-area .guess-row");
    guessesRows.forEach((item, rowIndex) => {
        let rowWord = state.guesses[rowIndex] || "";
        let guessSlots = item.querySelectorAll(".guess-slot");
        
        guessSlots.forEach((slot, index) => {
            slot.innerText = rowWord.charAt(index);
            slot.classList.remove('correct-letter', 'present-letter', 'absent-letter');
            slot.classList.add(letterStatus[rowIndex + "_" + index]);
        });
    });
}

function _updateKeyboardArea (letterStatus) {
    document.querySelectorAll(".keyboard_key").forEach(k => {
        k.classList.remove('correct-letter', 'present-letter', 'absent-letter');
        k.classList.add(letterStatus[k.getAttribute("data-key")]);
    });

    
    const enterButton = document.querySelector('.enter_key'); // 使用类名来选择 Enter 按钮

    // 根据当前猜测的长度启用或禁用 Enter 键
    enterButton.disabled = state.currentGuess.length !== 6;
    if (state.currentGuess.length === 6) {
        enterButton.classList.remove('disabled');
    } else {
        enterButton.classList.add('disabled');
    }
}



function stateChanged() {
    window.localStorage.setItem("state", JSON.stringify(state));
    // _redrawGuessArea();
    // _redrawGuessesArea();

    // 
    // console.log("x_state", state);

    let letterStatus = {};
    for (let i = 0; i < state.guesses.length; i++) {
        let word = state.guesses[i];
        
        for (let j = 0; j < word.length; j++) {
            let status = 'absent-letter';
            if (word[j] === state.targetWord[j]) {
                status = 'correct-letter';
            } else if (state.targetWord.includes(word[j])) {
                status = 'present-letter';
            }
            if (letterStatus[word[j]] !== 'correct-letter')
                letterStatus[word[j]] = status;
            letterStatus[i + '_' + j] = status;
        }
    }
    _updateGuessesArea(letterStatus);
    _updateKeyboardArea(letterStatus);
}

function alphaKey(key) {
    if (!state.gameOver) {
        if (state.currentGuess.length < 6) {
            addVisualIndication(key);

            state.currentGuess += key.toLowerCase();
            stateChanged()
        }
    }
}


function addVisualIndication(keyValue) {
    // 选择具有特定数据属性的元素
    const keyElement = document.querySelector(`[data-key="${keyValue}"]`);

    
    // 检查元素是否存在
    if (keyElement) {
        // 定义颜色常量
        const indicationColor = "#000"; // 可以根据需要调整颜色

        // console.log("Element found:", keyElement); // 添加这一行控制台检查

        // 添加视觉指示
        keyElement.style.backgroundColor = indicationColor;

        // 在200毫秒后恢复背景颜色
        setTimeout(() => {
            // 在闭包中使用 keyElement
            keyElement.style.backgroundColor = "";
        }, 200);
    } else {
        console.error(`Can NOT find ${keyValue} element`);
    }
}



//
function enterKey() {
    if (!state.gameOver) {
        if (state.currentGuess.length === 6) {
            // Check if valid
            // If it is, add tp state.guesses
            // Reset state.current
            submitGuess();
            // stateChanged();
        }
    }
}

function backspaceKey() {
    if (!state.gameOver) {
        if (state.currentGuess.length > 0) {
            state.currentGuess = state.currentGuess.slice(0, -1);
            stateChanged()
        }
    }
}

async function initState(newGame) {
    
    if (newGame || !window.localStorage.getItem("state")) {
        
        state = {
            gameOver: false,
            targetWord: '',
            currentGuess: '',
            guesses: [],
            currentGuessIndex: 0
        };

        state.targetWord = await fetchTargetWord();
    } else {
        state = JSON.parse(window.localStorage.getItem("state"));
    }

    //
    _redrawGuessArea();
    _redrawGuessesArea();

    stateChanged();
}

// start
window.addEventListener("load", async () => {
    initState(false);

    document.querySelectorAll(".keyboard_key").forEach(k => {
        k.addEventListener("click", () => {
            alphaKey(k.getAttribute("data-key"));
        });
    });

    document.querySelector(".enter_key").addEventListener("click", enterKey);
    document.querySelector(".backspace_key").addEventListener("click", backspaceKey);
    document.querySelector(".new_game_key").addEventListener("click", promptForNewGame);

    window.addEventListener("keydown", (evt) => {
        if (evt.key === "Enter") {
            enterKey();
        } else if (evt.key === "Backspace") {
            backspaceKey();
        } else if (evt.key.match(/^[a-zA-Z]$/)) {
            alphaKey(evt.key.toLowerCase());
        } else if (evt.key === 'Escape'){
            promptForNewGame();
        }
    });
    // wire up event handlers
});


// 获取一个6个字母的单词的函数
async function fetchTargetWord() {
    // console.log("Start getting word");
    try {
        let response = await fetch('https://words.trex-sandwich.com/?count=1&length=6');
        if (!response.ok) {
            throw new Error('Network response error');//网络响应错误
        }

        let data = await response.json();
        console.log('response data:', data); // 检查响应数据
        if (!data || data.length === 0) {
            throw new Error('No valid data received');//未获取到有效数据
        }
        
        let targetWord = data[0];
        console.log('TARGET WORD:', targetWord);
        return targetWord;
    } catch (error) {
        console.error('Error fetching TARGET WORD:', error);//获取目标词错误
    }
}

function submitGuess() {
    validateGuess(state.currentGuess).then(isValid => {
        if (isValid) {
            console.log('Valid guess:', state.currentGuess);
            state.guesses.push(state.currentGuess);
            // displayGuess(state.currentGuess); // 显示猜测并设置颜色
            
            // updateGuessDisplay(); // 清空当前猜测区域

            if (state.currentGuess == state.targetWord) {
                alert("Congratulations! YOU WIN");
                state.gameOver = true;
            } else if(state.guesses.length == 6) {
                alert("Game over! correct answer is " + state.targetWord);
                state.gameOver = true;
            }
            state.currentGuess = '';
            stateChanged();

            if (state.gameOver) {
                // 游戏结束后提示开始新游戏
                promptForNewGame();
            }
        } else {
            shakeAnimation(); // 如果猜测无效，进行动画提示
        }
    });

    // saveGameState();  // 保存状态
}

function validateGuess(guess) {
    return fetch(`https://words.trex-sandwich.com/${guess}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Response data:', data); // 用于调试
            return data.valid; // 确保响应格式是预期的格式
        })
        .catch(error => {
            console.error('Error fetching word validation:', error);
            return false;
        });
}

function promptForNewGame() {
    const startNewGame = confirm("Would you want new game?");
    if (startNewGame) {
        initState(true);
        stateChanged();
    } else {
        // 玩家选择“否”，关闭提示并保持当前游戏状态
    }
}

function shakeAnimation() {
    const guessArea = document.querySelector('.guess-area'); // 替换为您的猜测显示区域的选择器
    guessArea.classList.add('shake-animation');

    // 动画完成后移除类，以便将来可以再次触发动画
    setTimeout(() => {
        guessArea.classList.remove('shake-animation');
    }, 500); // 500毫秒是动画持续时间
}



document.addEventListener("DOMContentLoaded", function () {
    //
    // const onScreenKeyboard = document.querySelector(".keyboard-module");
    // const physicalKeyboardKeys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'Enter', 'Backspace', 'Escape'];

    // onScreenKeyboard.addEventListener("click", function (event) {
    //     handleButtonClick(event.target.dataset.key);
    // });
    
//     
//     

// //TASK 2
//     

//     document.addEventListener("keydown", function (event) {
//         handleKeyPress(event.key);
//     });

//     function handleButtonClick(keyValue) {
//         if (isValidKey(keyValue)) {
//             addVisualIndication(keyValue);

//             //
//             addChar(keyValue);
//         }
//     }

//     function handleKeyPress(keyValue) {
//         if (isValidKey(keyValue)) {
//             console.log(keyValue);
//             addVisualIndication(keyValue);
//             // 检查是否按下 Escape 键
//             if (keyValue === 'Escape') {
//                 console.log("New Game");
//             }
//         }
//     }

//     function isValidKey(keyValue) {
//         return physicalKeyboardKeys.includes(keyValue);
//     }



//     // 针对物理键盘的事件监听
//     document.addEventListener("keydown", function (event) {
//         const physicalKeyValue = event.key;
//         const correspondingVirtualKey = getCorrespondingVirtualKey(physicalKeyValue);

//         if (correspondingVirtualKey) {
//             // console.log(correspondingVirtualKey); // 在控制台打印大写键值
//             addVisualIndication(correspondingVirtualKey);
//         }
//     });

//     //将物理键盘的键映射到虚拟键盘上的键
//     function getCorrespondingVirtualKey(physicalKeyValue) {
//         return physicalKeyValue; //全部大写
//     }

    
// //TASK 3
//     // state.targetWord = '';
//     const enterButton = document.querySelector('.enter_key'); // 使用类名来选择 Enter 按钮

//     // console.log("Start working");

//     // 初始化时禁用 Enter 按钮
//     enterButton.disabled = true;
//     enterButton.classList.add('disabled'); // 添加一个类用于设置禁用状态的样式
//     console.log("Do not use Enter button.");



// //TASK4

//     function addChar(key) {

//         if (key >= 'a' && key <= 'z' && state.currentGuess.length < 6) {
//             // 添加字母到当前猜测
//             state.currentGuess += key.toLowerCase();
//             updateGuessDisplay();
//         } else if (key === 'Backspace' && state.currentGuess.length > 0) {
//             // 删除最后一个字母
//             state.currentGuess = state.currentGuess.slice(0, -1);
//             updateGuessDisplay();
//         } else if (key === 'Enter' && state.currentGuess.length === 6) {
//                 submitGuess();
//         } else if (key === 'Escape'){
//             promptForNewGame();
//         }
        
//         saveGameState();  // 保存状态
//     }

//     document.addEventListener('keydown', function(event) {
//         addChar(event.key);
//     });


//     // 更新当前猜测显示和 Enter 键的状态
//     function updateGuessDisplay() {
//         let index = state.guesses.length;
//         let rows = document.getElementsByClassName("guess-row");
//         let row = rows[index];
//         let slots = row.getElementsByClassName("guess-slot");
        
//         for (let i = 0; i < slots.length; i ++) {
//             let slot = slots[i];
//             slot.textContent = state.currentGuess[i] || '';
//         }

//         // const guessSlots = document.querySelectorAll('.guess-slot');
//         // guessSlots.forEach((slot, index) => {
//         //     slot.textContent = currentGuess[index] || '';
//         // });

//         // 根据当前猜测的长度启用或禁用 Enter 键
//         enterButton.disabled = state.currentGuess.length !== 6;
//         if (state.currentGuess.length === 6) {
//             enterButton.classList.remove('disabled');
//         } else {
//             enterButton.classList.add('disabled');
//         }
//     }

// //Task5

//     // 提交猜测
//     // let state.guesses = [];  // 存储玩家猜测的数组

//     function submitGuess() {
//         validateGuess(state.currentGuess).then(isValid => {
//             if (isValid) {
//                 console.log('Valid guess:', state.currentGuess);
//                 state.guesses.push(state.currentGuess);
//                 displayGuess(state.currentGuess); // 显示猜测并设置颜色
                
//                 // updateGuessDisplay(); // 清空当前猜测区域

//                 endGame(state.currentGuess);
//                 state.currentGuess = '';
                
//             } else {
//                 shakeAnimation(); // 如果猜测无效，进行动画提示
//             }
//         });

//         saveGameState();  // 保存状态
//     }

//     function shakeAnimation() {
//         const guessArea = document.querySelector('.guess-area'); // 替换为您的猜测显示区域的选择器
//         guessArea.classList.add('shake-animation');
    
//         // 动画完成后移除类，以便将来可以再次触发动画
//         setTimeout(() => {
//             guessArea.classList.remove('shake-animation');
//         }, 500); // 500毫秒是动画持续时间
//     }
    

//     // 验证猜测的单词是否有效
//     function validateGuess(guess) {
//         return fetch(`https://words.trex-sandwich.com/${guess}`)
//             .then(response => {
//                 if (!response.ok) {
//                     throw new Error(`HTTP error! status: ${response.status}`);
//                 }
//                 return response.json();
//             })
//             .then(data => {
//                 console.log('Response data:', data); // 用于调试
//                 return data.valid; // 确保响应格式是预期的格式
//             })
//             .catch(error => {
//                 console.error('Error fetching word validation:', error);
//                 return false;
//             });
//     }
    
// //TASK6
// const maxTries = 6;


// initializeGuessArea();

//     function initializeGuessArea() {
//         const guessesArea = document.querySelector('.guesses-area');

//         for (let i = 0; i < maxTries; i++) {
//             const guessRow = document.createElement('div');
//             guessRow.className = 'guess-row';

//             for (let j = 0; j < 6; j++) {  
//                 const letterSlot = document.createElement('div');
//                 letterSlot.className = 'guess-slot';
//                 guessRow.appendChild(letterSlot);
//             }

//             guessesArea.appendChild(guessRow);
//         }
//     }

//     function displayGuess(guess) {
//         let index = state.guesses.length - 1;
//         let rows = document.getElementsByClassName("guess-row");
//         let row = rows[index];
//         let slots = row.getElementsByClassName("guess-slot");
        
//         for (let i = 0; i < slots.length; i ++) {
//             let slot = slots[i];
//             slot.classList.add(getLetterClass(guess[i], i));
//         }

//         updateKeyboardKeyColor();

//         // for (let n = 0; n < )
//         // const guessesContainer = document.querySelector('.guesses-area');
//         // const guessElement = document.createElement('div');
//         // guessElement.className = 'guess-row';

//         // for (let i = 0; i < guess.length; i++) {
//         //     const letterElement = document.createElement('div');
//         //     letterElement.textContent = guess[i];
//         //     letterElement.className = 'guess-slot ' + getLetterClass(guess[i], i);
//         //     guessElement.appendChild(letterElement);
//         // }

//         // guessesContainer.appendChild(guessElement);
//     }


// function getLetterClass(letter, index) {
//     if (state.targetWord[index] === letter) {
//         return 'correct-letter'; // 字母正确且位置正确
//     } else if (state.targetWord.includes(letter)) {
//         return 'present-letter'; // 字母正确但位置不正确
//     } else {
//         return 'absent-letter'; // 字母不在目标单词中
//     }
// }



// function updateKeyboardKeyColor() {
//     for (let i = 0; i < state.currentGuess.length; i++) {
//         let className = getLetterClass(state.currentGuess[i], i);
//         let letter = state.currentGuess[i];
//         const keyElement = document.querySelector(`[data-key="${letter.toLowerCase()}"]`);
//         if (keyElement) {
//             keyElement.classList.remove('correct-letter', 'present-letter', 'absent-letter');
//             keyElement.classList.add(className);
//         }
//     }
// }

// //TASK 7
//     function promptForNewGame() {
//         const startNewGame = confirm("Would you want new game?");
//         if (startNewGame) {
//             resetGame();
//         } else {
//             // 玩家选择“否”，关闭提示并保持当前游戏状态
//         }
//     }

//     function resetGame() {
//         state.targetWord = '';
//         state.currentGuess = '';
//         state.guesses = [];
//         state.currentGuessIndex = 0;

//         const keys = document.querySelectorAll('.keyboard_key'); 
//         keys.forEach(key => {
//             key.classList.remove('correct-letter', 'present-letter', 'absent-letter');
//             key.style.backgroundColor = ""; // 重置背景颜色
        
//         });

        
//         const guessSlots = document.querySelectorAll('.guess-slot');
//         guessSlots.forEach(slot => {
//             slot.textContent = '';
//             slot.className = 'guess-slot';
//         });

//         fetchTargetWord();  // 获取新的目标单词

//         saveGameState();  // 保存状态
//     }


//     function endGame(guess) {
        
//         if (guess == state.targetWord) {
//             alert("Congratulations! YOU WIN");
//         } else if(state.guesses.length == 6) {
//             alert("Game over! correct answer is " + state.targetWord);
//         } else {
//             return;
//         }
//         // 游戏结束后提示开始新游戏
//         promptForNewGame();
//     }

// //TASK8
// function saveGameState() {
//     localStorage.setItem('wordleGameState', JSON.stringify(state));
// }

// document.addEventListener("DOMContentLoaded", function () {
    
//     state = {
//         targetWord: '',
//         currentGuess: '',
//         guesses: [],
//         currentGuessIndex: 0
//     };
//     // targetWord = '';
//     // currentGuess = '';
//     // guesses = [];
//     // currentGuessIndex = 0;

//     if (localStorage.getItem('wordleGameState')) {
//         loadGameState();
//     } else {
//         fetchTargetWord();
//         initializeGuessArea();
//     }
// });

// function loadGameState() {
//     const savedState = JSON.parse(localStorage.getItem('wordleGameState'));
//     state = savedState;

//     // 更新 UI
//     updateGuessDisplay();
//     state.guesses.forEach(guess => displayGuess(guess));
// }

});

