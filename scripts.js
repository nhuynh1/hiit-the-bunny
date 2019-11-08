let isPaused = false;

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
const notificationSound = timer.querySelector('audio#notification');

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

const playNotification = () => {
  if(!isPaused) {
    notificationSound.currentTime = 0;
    notificationSound.play();
  }
}

const speakAction = () => {
  
}

const showNextAction = (nextAction) => timerNextAction.textContent = ["", "last exercise"].includes(nextAction) ? nextAction : `Next: ${nextAction}`;

const showAction = (action) => timerAction.textContent = action;

const showSecond = (num) => {
  timerSeconds.textContent = num;
  if(num <= notifySecondsToNextExercise){
    if(flashBackgroundOn) flashBackground(timer);
    if(notificationOn) playNotification();
  }
}

const updateButton = (button, textContent) => button.textContent = textContent;

/*******************************************
  Workouts data
********************************************/
const workout = [
        {action: "Jump Squats", seconds: 6}, 
        {action: "Push-ups", seconds: 6},
        {action: "Burpees", seconds: 6},
        {action: "Rest", seconds: 2},
        {action: "Jump Squats", seconds: 6}
      ];
//  , 
//        {action: "Push-ups", seconds: 60},
//        {action: "Burpees", seconds: 60},
//        {action: "Rest", seconds: 20},
//        {action: "Jump Squats", seconds: 60}, 
//        {action: "Push-ups", seconds: 60},
//        {action: "Burpees", seconds: 60},
//        {action: "Rest", seconds: 20}
//    ];

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
        showAction(action);
        showSecond(seconds);
        showNextAction(nextAction);
        let timer = setInterval(() => {
          if(!isPaused) seconds--;
          showSecond(seconds);
          if(seconds === 0){
            clearInterval(timer);
            setTimeout(() => resolve(), 1000);
          }
        }, 1000);
      });
  }
}

const endWorkOut = () => {
  return () => {
    return new Promise(function (resolve) {
      showAction("Workout Complete");
      showSecond("");
      showNextAction("");
      pause.style.visibility = 'hidden';
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
  sequence(workoutReady.concat(workoutQueue, endWorkOut()));
}

const pauseWorkOut = () => {
  isPaused = !isPaused;
  updateButton(pause, isPaused ? 'resume' : 'pause');
}

/*******************************************
  Event listeners
********************************************/
// nothing here yet
