/*******************************************
  DOM elements
********************************************/
const $workoutTemplate = document.querySelector('#workouts-template'),
      $workoutsContainer = document.querySelector('.exercises');

/*******************************************
  Utility functions
********************************************/
const roundToOneDecimal = (n) => Math.round(n * 10) / 10;

const totalWorkoutDuration = (workout = []) => {
  const duration = workout.reduce((total, exercise) => {
                      if(exercise.action.toLowerCase() === "rest"){
                        total.rest += exercise.seconds / 60;
                      } else {
                        total.on += exercise.seconds / 60;
                      }
                      return total;
                  }, {rest: 0, on: 0});
  duration.total = duration.on + duration.rest;
  return duration;
}

/*******************************************
  Templating functions
********************************************/
const listWorkouts = (workouts, workoutNames, template) => {
  workouts.forEach((workout, index, self) => {
    const workoutDuration = totalWorkoutDuration(workout);
    const workoutTemplate = template.content.cloneNode(true);
    workoutTemplate.querySelector('.action h2').textContent = workoutNames[index];
    workoutTemplate.querySelector('.action span').textContent = `${roundToOneDecimal(workoutDuration.total)} minutes ∙ ${roundToOneDecimal(workoutDuration.on)} minutes on ∙ ${roundToOneDecimal(workoutDuration.rest)} minutes rest`;
    workoutTemplate.querySelector('a').href = `workouts.html?workout=${index}`;

    $workoutsContainer.insertBefore(workoutTemplate, template);
  });
}

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
        {action: "Rest", seconds: 30},
        {action: "Bicep Curls", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Lateral Shoulder Raises", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Dumbbell Rows, Right Arm", seconds: 30},
        {action: "Rest", seconds: 10},
        {action: "Dumbbell Rows, Left Arm", seconds: 30},
        {action: "Rest", seconds: 30},
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

const workoutShoulders = [
        {action: "Lateral Shoulder Raises", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Tricep Dips", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Dumbbell Front Raises", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Overhead Tricep Extensions", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Lateral Shoulder Raises", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Tricep Dips", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Dumbbell Front Raises", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Overhead Tricep Extensions", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Lateral Shoulder Raises", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Tricep Dips", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Dumbbell Front Raises", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Overhead Tricep Extensions", seconds: 30}
]

const workoutBackChest = [
        {action: "Dumbbell Rows, Right Arm", seconds: 30},
        {action: "Rest", seconds: 10},
        {action: "Dumbbell Rows, Left Arm", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Dumbbell Chest Presses", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Bentover Reverse Flye", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Inclined Push-ups", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Dumbbell Rows, Right Arm", seconds: 30},
        {action: "Rest", seconds: 10},
        {action: "Dumbbell Rows, Left Arm", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Dumbbell Chest Presses", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Bentover Reverse Flye", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Inclined Push-ups", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Dumbbell Rows, Right Arm", seconds: 30},
        {action: "Rest", seconds: 10},
        {action: "Dumbbell Rows, Left Arm", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Dumbbell Chest Presses", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Bentover Reverse Flye", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Inclined Push-ups", seconds: 30},
]

const workouts = [workoutTest, workoutLegs, workoutArms, workoutShoulders, workoutBackChest];
const workoutsTitles = ["For Testing", "Girl Power Legs", "Bunny Arms", "Bunny Shoulders", "Chest & Back"];

/*******************************************
  Load page data
********************************************/
listWorkouts(workouts, workoutsTitles, $workoutTemplate);