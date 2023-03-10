import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

const refreshButton = document.querySelector('#refresh_button');
const newChatButton = document.querySelector('#new_chat_button');

refreshButton.addEventListener('click', startNewChat);
newChatButton.addEventListener('click', startNewChat);;

let loadInterval;

function startNewChat() {
  // clear chat messages
  const chatMessages = document.querySelectorAll('.chat');
  chatMessages.forEach(message => message.remove());

  // reset chat form
  const chatForm = document.querySelector('form');
  const chatInput = document.querySelector('textarea');
  chatInput.value = '';
  chatInput.focus();

  // reset chat history or conversation context
  chatHistory = [];
  conversationContext = {
    topic: '',
    mood: 'neutral',
    userName: '',
    userAge: 0,
    userGender: '',
    userLocation: '',
  };
}

function loader(element) {
  element.textContent = '';  

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300)
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if(index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20)
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe (isAi, value, uniqueId) {
  return (
    `
      <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
          <div class="profile">
            <img
              src="${isAi ? bot : user}"
              alt="${isAi ? 'bot' : 'user'}"
            />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `
  )
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  form.reset();

  // bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight - chatContainer.clientHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // fetch data from server -> bot's response
  
  try {
    const response = await fetch('https://codex-hdtm.onrender.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          prompt: data.get('prompt')
      }) 
    })  

    clearInterval(loadInterval);
    messageDiv.innerHTML = '';  

    if(response.ok) {
      const data = await response.json();
      const parsedData = data.bot.trim();

      // To trace error location
      //console.log({parsedData})

      typeText(messageDiv, parsedData);
    } else {
      throw new Error(await response.text());
    }
  } catch (error) {       

    // user's chatstripe
    //chatContainer.inner  

    clearInterval(loadInterval);  
    messageDiv.innerHTML = '';
    messageDiv.innerHTML = "Something went wrong";

    alert(error);    
  } 
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});