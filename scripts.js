let isPaused = false;
let isStarted = false;
let isCurrentActionSkipped = false;

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
const countDown = ({ action, seconds, nextAction }) => {
  return () => {  
    return new Promise(function (resolve) {
        isCurrentActionSkipped = false; // updated
        let remainingSeconds = seconds;
        showAction(action);
        showNextAction(nextAction);
        speakAction(getActionSpeech(action, remainingSeconds));
        processSecond(remainingSeconds, seconds, nextAction);
  
        let timer = setInterval(() => {
          if(!isPaused) remainingSeconds--;
          processSecond(remainingSeconds, seconds, nextAction);
          if(remainingSeconds === 0 || isCurrentActionSkipped){ // skip action for testing
            clearInterval(timer);
            setTimeout(() => resolve(), 1000);
          }
        }, 1000);
      });
  }
}

const endWorkOut = (action = "Workout Complete") => {
  return () => {
    return new Promise(function (resolve) {
      showAction(action);
      speakAction(action);
      showSecond("");
      showNextAction("");
      pause.style.visibility = 'hidden';
      isStarted = false;
      resolve();
    });
  }
}

const startWorkOut = (workout) => {
  const workoutReady = [countDown({ action: "Get Ready", seconds: 10, nextAction: (workout[0]).action })];
  const workoutQueue = workout.map((exercise, index, self) => {
    const nextExercise = self[index + 1];
    exercise.nextAction = nextExercise ? nextExercise.action : "last exercise";
    return countDown(exercise);
  });
  timer.style.visibility = 'visible';
  isPaused = false;
  isStarted = true;
  isCurrentActionSkipped = false; // skip action for testing
  sequence(workoutReady.concat(workoutQueue, endWorkOut()));
}

const pauseWorkOut = () => {
  isPaused = !isPaused;
  updateButton(pause, isPaused ? 'resume' : 'pause');
}

const skipAction = () => isCurrentActionSkipped = true;


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