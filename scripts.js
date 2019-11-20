/*******************************************
  Settings (to be queried from JSON or local storage)
********************************************/
let notifySecondsToNextExercise = 3;
let flashBackgroundOn = false;
let notificationOn = true;
  
/*******************************************
  DOM elements
********************************************/    
const pause = document.getElementById('pause');
const timer = document.getElementById('timer');
const timerSeconds = timer.querySelector('.timerSeconds');
const timerAction = timer.querySelector('.timerAction');
const timerNextAction = timer.querySelector('.timerNextAction');
const notificationSound1 = timer.querySelector('audio#notification1');
const notificationSound2 = timer.querySelector('audio#notification2');

/*******************************************
  Templating functions
********************************************/
const flashBackground = (background, duration = 300) => {
  background.style.backgroundColor = '#fb5686';
  if(!isPaused) {
    setTimeout(() => {
      background.style.backgroundColor = 'white';
    }, duration);
  }
}

const playNotification = (notificationSound) => {
  if(!isPaused) {
    notificationSound.currentTime = 0;
    notificationSound.play();
  }
}

const getActionSpeech = (action, seconds = "") => {
  return `${action}. ${typeof seconds === "number" ? `${seconds} seconds.` : seconds}`;
}

const getNextActionSpeech = (nextAction, totalSeconds) => {
  if(totalSeconds > 10)
    return `You're almost done. ${nextAction === "last exercise" ? `This is the ${nextAction}.` : `Next: ${nextAction}.`}`;
  if(totalSeconds === 10)
    return `Next: ${nextAction}`;
} 

// speech needs to stop when skipping exercises otherwise the queue continues to speak

const speakAction = (speech = "") => {
  if("speechSynthesis" in window && "SpeechSynthesisUtterance" in window){
    const synth = window.speechSynthesis;
    const utterThis = new SpeechSynthesisUtterance();
    utterThis.rate = 1.3;
    utterThis.text = speech;
    synth.speak(utterThis);  
  } else {
    console.warn("Speech Synthesis API is not available with your broswer. There will be no voice notification of each exercise.")
  }
}

const showNextAction = (nextAction) => timerNextAction.textContent = ["", "last exercise"].includes(nextAction) ? nextAction : `Next: ${nextAction}`;

const showAction = (action) => timerAction.textContent = action;

const showSecond = (second) => timerSeconds.textContent = second;

const processSecond = (remainingSeconds, totalSeconds, nextAction) => {
  if(isPaused) return;
  showSecond(remainingSeconds);
  if(remainingSeconds <= notifySecondsToNextExercise){
    if(flashBackgroundOn) flashBackground(timer);
    if(notificationOn) {
      if(remainingSeconds !== 0) playNotification(notificationSound1);
      else playNotification(notificationSound2);
    }
  }
  
  if(remainingSeconds === 10) {
    let speech = getNextActionSpeech(nextAction, totalSeconds);
    speakAction(speech);
  }
}

const updateButton = (button, textContent) => button.textContent = textContent;

/*******************************************
  Workouts data
********************************************/
//const workout = [
//        {action: "Bicep Curls", seconds: 30},
//        {action: "Rest", seconds: 30},
//        {action: "Lateral Shoulder Raises", seconds: 30},
//        {action: "Rest", seconds: 30},
//        {action: "Dumbbell Rows, Right Arm", seconds: 30},
//        {action: "Rest", seconds: 10},
//        {action: "Dumbbell Rows, Left Arm", seconds: 30}
//      ];

const workout = [
        {action: "Bicep Curls", seconds: 20},
        {action: "Rest", seconds: 20},
        {action: "Lateral Shoulder Raises", seconds: 20},
        {action: "Rest", seconds: 20},
        {action: "Dumbbell Rows, Right Arm", seconds: 20}
      ];

/*******************************************
  Utility functions
********************************************/
const sequence = (fns) => {
  var fn = fns.shift();
  return fn ? fn().then(() => sequence(fns)) : Promise.resolve(undefined);
}

/*******************************************
  Workouts functions
********************************************/  

let currentActionIndex = 0,
    isPaused = false,
    isStarted = false;
const prevButton = document.querySelector('#prev'),
      nextButton = document.querySelector('#next');

const countDown = ({ action, seconds, nextAction}) => {
    return new Promise(function (resolve) {
        let remainingSeconds = seconds;
        showAction(action);
        showNextAction(nextAction);
        speakAction(getActionSpeech(action, remainingSeconds));
        processSecond(remainingSeconds, seconds, nextAction); 
      
        let timer = setInterval(() => {
          if(!isPaused) remainingSeconds--;
          processSecond(remainingSeconds, seconds, nextAction);
          
          if(remainingSeconds === 0){
            clearInterval(timer);
            currentActionIndex++;
            setTimeout(() => resolve(), 1000);
          }
        }, 1000);
        
        const resolveImmediately = () => {
          clearInterval(timer);
          resolve();
        } 
      
        prevButton.onclick = () => {
          currentActionIndex = Math.max(0, currentActionIndex - 1);
          resolveImmediately();
        }

        nextButton.onclick = () => {
          currentActionIndex++;
          resolveImmediately();
        }
      });
}

const endWorkOut = (action = "Workout Complete") => {
  return new Promise(function (resolve) {
    showAction(action);
    speakAction(action);
    showSecond("");
    showNextAction("");
    pause.style.visibility = 'hidden';
    prevButton.style.visibility = 'hidden';
    nextButton.style.visibility = 'hidden';
    isStarted = false;
    prevButton.onclick = undefined;
    nextButton.onclick = undefined;
    resolve();
  });
}

const startWorkOut = async () => {
  currentActionIndex = -1;
  timer.style.visibility = 'visible';
  prevButton.style.visibility = 'visible';
  nextButton.style.visibility = 'visible';
  isPaused = false;
  isStarted = true;
  await countDown({action: "Get ready", seconds: 10, nextAction: (workout[0]).action});
  while(workout[currentActionIndex]){
    let exercise = {...workout[currentActionIndex]};
    let nextExercise = workout[currentActionIndex + 1];
    exercise.nextAction = nextExercise ? nextExercise.action : "last exercise";
    await countDown(exercise); // capture the currentActionIndex from the Promise so we can take out the variable?
  }
  await endWorkOut();
}

const pauseWorkOut = () => {
  isPaused = !isPaused;
  updateButton(pause, isPaused ? 'resume' : 'pause');
}

const closeTimer = () => {
  timer.style.visibility = 'hidden';
}

/*******************************************
  Event listeners and handlers
********************************************/
const keyHandler = (e) => {
  if(e.keyCode !== 32) return;
  
  if(!isStarted) 
    startWorkOut(workout);
  else 
    pauseWorkOut();
}

document.addEventListener('keydown', keyHandler)