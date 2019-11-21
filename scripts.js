/*******************************************
  Initialization functions
********************************************/
const initializeSpeechSynthesis = () => {
  if("speechSynthesis" in window && "SpeechSynthesisUtterance" in window){
     const synth = window.speechSynthesis;
     const utterThis = new SpeechSynthesisUtterance();
     utterThis.rate = 1.3;
     synth.cancel();
     return {synth, utterThis};
  }
  else {
    console.warn("Speech Synthesis API is not available with your broswer. There will be no voice notification of each exercise.");
    return {synth: undefined, utterThis: undefined};
  }
}

/*******************************************
  Initialization variables
********************************************/
const {synth, utterThis} = initializeSpeechSynthesis();
let currentActionIndex,
    isPaused = false,
    isStarted = false;

/*******************************************
  Settings (to be queried from JSON or local storage)
********************************************/
let notifySecondsToNextExercise = 3;
let flashBackgroundOn = false;
let notificationOn = true;
  
/*******************************************
  DOM elements
********************************************/    
const $timer = document.getElementById('timer');
const $timerSeconds = $timer.querySelector('.timerSeconds');
const $timerAction = $timer.querySelector('.timerAction');
const $timerNextAction = $timer.querySelector('.timerNextAction');

const $notificationSound1 = $timer.querySelector('audio#notification1'),
      $notificationSound2 = $timer.querySelector('audio#notification2');

const $prevButton = $timer.querySelector('#prev'),
      $nextButton = $timer.querySelector('#next'),
      $closeButton = $timer.querySelector('#end'),
      $pauseButton = $timer.querySelector('#pause');

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

const speakAction = (speech = "", synth, utterThis) => {
  if(!synth || !utterThis) return;
  utterThis.text = speech;
  synth.speak(utterThis);
  if(isPaused) synth.pause();
}

const showNextAction = (nextAction) => $timerNextAction.textContent = ["", "last exercise"].includes(nextAction) ? nextAction : `Next: ${nextAction}`;

const showAction = (action) => $timerAction.textContent = action;

const showSecond = (second) => $timerSeconds.textContent = second;

const processSecond = (remainingSeconds, totalSeconds, nextAction) => {
  showSecond(remainingSeconds);
  if(isPaused) return;
  if(remainingSeconds <= notifySecondsToNextExercise){
    if(flashBackgroundOn) flashBackground($timer);
    if(notificationOn) {
      if(remainingSeconds !== 0) playNotification($notificationSound1);
      else playNotification($notificationSound2);
    }
  }
  
  if(remainingSeconds === 10) {
    let speech = getNextActionSpeech(nextAction, totalSeconds);
    speakAction(speech, synth, utterThis);
  }
}

const updateButton = (button, textContent) => button.textContent = textContent;

/*******************************************
  Workouts data
********************************************/
const workoutArms = [
        {action: "Bicep Curls", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Lateral Shoulder Raises", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Dumbbell Rows, Right Arm", seconds: 30},
        {action: "Rest", seconds: 10},
        {action: "Dumbbell Rows, Left Arm", seconds: 30},
        {action: "Rest", seconds: 10},
        {action: "Bicep Curls", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Lateral Shoulder Raises", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Dumbbell Rows, Right Arm", seconds: 30},
        {action: "Rest", seconds: 10},
        {action: "Dumbbell Rows, Left Arm", seconds: 30},
      ];

const workoutTest = [
        {action: "Bicep Curls", seconds: 20},
        {action: "Rest", seconds: 20},
        {action: "Lateral Shoulder Raises", seconds: 20},
        {action: "Rest", seconds: 20},
        {action: "Dumbbell Rows, Right Arm", seconds: 20}
      ];

const workoutLegs = [
        {action: "Goblet Squats", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Glute Bridges", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Deadlift with Dumbbells", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Calf Raises", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Goblet Squats", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Glute Bridges", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Deadlift with Dumbbells", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Calf Raises", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Goblet Squats", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Glute Bridges", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Deadlift with Dumbbells", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Calf Raises", seconds: 30}
      ];


/*******************************************
  Workouts functions
********************************************/  
const countDown = ({ action, seconds, nextAction}) => {
    return new Promise(function (resolve) {
        let remainingSeconds = seconds;
        showAction(action);
        showNextAction(nextAction);
        speakAction(getActionSpeech(action, remainingSeconds), synth, utterThis);
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
          synth.cancel();
          clearInterval(timer);
          resolve();
        } 
      
        $prevButton.onclick = () => {
          currentActionIndex = Math.max(0, currentActionIndex - 1);
          resolveImmediately();
        }

        $nextButton.onclick = () => {
          currentActionIndex++;
          resolveImmediately();
        }
        
        $closeButton.onclick = () => {
          currentActionIndex = undefined;
          resolveImmediately();
          $timer.style.visibility = 'hidden';
        }
      });
}

const endWorkOut = (action = "Workout Complete") => {
  return new Promise(function (resolve) {
    showAction(action);
    speakAction(action, synth, utterThis);
    showSecond("");
    showNextAction("");
    $timer.classList.add('workout-ended');
    isStarted = false;
    $prevButton.onclick = null;
    $nextButton.onclick = null;
    resolve();
  });
}

const startWorkOut = async (workout) => {
  currentActionIndex = -1;
  $timer.style.visibility = 'visible';
  $timer.classList.remove('workout-ended');
  isPaused = false;
  isStarted = true;
  await countDown({action: "Get ready", seconds: 10, nextAction: (workout[0]).action});
  while(workout[currentActionIndex]){
    let exercise = {...workout[currentActionIndex]};
    let nextExercise = workout[currentActionIndex + 1];
    exercise.nextAction = nextExercise ? nextExercise.action : "last exercise";
    await countDown(exercise); // capture the currentActionIndex from the Promise so we can take out the variable?
  }
  if(currentActionIndex) await endWorkOut();
}

const pauseWorkOut = () => {
  isPaused = !isPaused;
  updateButton($pauseButton, isPaused ? 'resume' : 'pause');
  if(isPaused){
    synth.pause();
  }
  else {
    if(synth.speaking) synth.resume();
  }
}

/*******************************************
  Event listeners and handlers
********************************************/
const keyHandler = (e) => {
  e.preventDefault();
  if(e.keyCode !== 32) return;
  
  if(!isStarted) 
    startWorkOut(workout); // will need to grab current workout eventually
  else 
    pauseWorkOut();
}

document.addEventListener('keydown', keyHandler)