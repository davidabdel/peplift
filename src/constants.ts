export interface Set {
  weight: number;
  reps: number;
  completed?: boolean;
}

export interface Exercise {
  name: string;
  sets: Set[];
  notes?: string;
}

export interface Circuit {
  name: string;
  rounds: number;
  exercises: Exercise[];
}

export const WORKOUT_DATA: Circuit[] = [
  {
    "name": "Circuit 1",
    "rounds": 3,
    "exercises": [
      {
        "name": "Hammer Curl",
        "sets": [
          {"weight": 8, "reps": 12},
          {"weight": 8, "reps": 12},
          {"weight": 8, "reps": 10}
        ],
        "notes": "PB Jan/Feb: 26kg, 6 rounds"
      },
      {
        "name": "Lateral Lunge",
        "sets": [
          {"weight": 20, "reps": 15},
          {"weight": 20, "reps": 15},
          {"weight": 20, "reps": 15}
        ]
      },
      {
        "name": "Overhead Tricep Extension",
        "sets": [
          {"weight": 12.5, "reps": 16},
          {"weight": 12.5, "reps": 15},
          {"weight": 12.5, "reps": 15}
        ]
      },
      {
        "name": "Romanian Deadlift (RDL)",
        "sets": [
          {"weight": 17.5, "reps": 12},
          {"weight": 17.5, "reps": 12},
          {"weight": 17.5, "reps": 12}
        ]
      },
      {
        "name": "Single Arm Neutral Grip Row",
        "sets": [
          {"weight": 12.5, "reps": 15},
          {"weight": 12.5, "reps": 15},
          {"weight": 12.5, "reps": 15}
        ]
      },
      {
        "name": "Decline Chest Press",
        "sets": [
          {"weight": 10, "reps": 18},
          {"weight": 10, "reps": 18},
          {"weight": 10, "reps": 18}
        ]
      },
      {
        "name": "Lateral Shoulder Raise",
        "sets": [
          {"weight": 3, "reps": 16},
          {"weight": 3, "reps": 16},
          {"weight": 3, "reps": 16}
        ]
      },
      {
        "name": "Reverse Crunch to Extension",
        "sets": [
          {"weight": 0, "reps": 20},
          {"weight": 0, "reps": 20},
          {"weight": 0, "reps": 20}
        ]
      },
      {
        "name": "Waiter Curls",
        "sets": [
          {"weight": 12.5, "reps": 20},
          {"weight": 12.5, "reps": 20},
          {"weight": 12.5, "reps": 20}
        ]
      },
      {
        "name": "Heel Elevated Close Squat",
        "sets": [
          {"weight": 15, "reps": 20},
          {"weight": 15, "reps": 20},
          {"weight": 15, "reps": 20}
        ]
      }
    ]
  },
  {
    "name": "Circuit 2",
    "rounds": 3,
    "exercises": [
      {
        "name": "Single Arm Overhead Tricep Extension",
        "sets": [
          {"weight": 6, "reps": 16},
          {"weight": 6, "reps": 16},
          {"weight": 6, "reps": 16}
        ]
      },
      {
        "name": "Single Leg Glute Bridge",
        "sets": [
          {"weight": 17.5, "reps": 20},
          {"weight": 17.5, "reps": 20},
          {"weight": 17.5, "reps": 20}
        ]
      },
      {
        "name": "Neutral Grip Row",
        "sets": [
          {"weight": 15, "reps": 12},
          {"weight": 15, "reps": 12},
          {"weight": 15, "reps": 12}
        ]
      },
      {
        "name": "Squeeze Chest Press",
        "sets": [
          {"weight": 12.5, "reps": 14},
          {"weight": 12.5, "reps": 14},
          {"weight": 12.5, "reps": 14}
        ]
      },
      {
        "name": "Around the World Press",
        "sets": [
          {"weight": 3, "reps": 10},
          {"weight": 3, "reps": 10},
          {"weight": 3, "reps": 10}
        ]
      },
      {
        "name": "Crunch + Knee Ins",
        "sets": [
          {"weight": 0, "reps": 25},
          {"weight": 0, "reps": 25},
          {"weight": 0, "reps": 25}
        ]
      },
      {
        "name": "Side Lateral Raise",
        "sets": [
          {"weight": 5, "reps": 12},
          {"weight": 5, "reps": 12},
          {"weight": 5, "reps": 12}
        ]
      },
      {
        "name": "Single Leg Squat",
        "sets": [
          {"weight": 20, "reps": 16},
          {"weight": 20, "reps": 16},
          {"weight": 20, "reps": 16}
        ]
      }
    ]
  },
  {
    "name": "Circuit 3",
    "rounds": 3,
    "exercises": [
      {
        "name": "Hammer Curl",
        "sets": [
          {"weight": 8, "reps": 13},
          {"weight": 8, "reps": 12},
          {"weight": 8, "reps": 11}
        ]
      },
      {
        "name": "Romanian Deadlift (RDL)",
        "sets": [
          {"weight": 17.5, "reps": 14},
          {"weight": 17.5, "reps": 14},
          {"weight": 17.5, "reps": 14}
        ]
      },
      {
        "name": "Close Grip Row",
        "sets": [
          {"weight": 20, "reps": 20},
          {"weight": 20, "reps": 20},
          {"weight": 20, "reps": 20}
        ]
      },
      {
        "name": "Skiers",
        "sets": [
          {"weight": 8, "reps": 18},
          {"weight": 8, "reps": 18},
          {"weight": 8, "reps": 18}
        ]
      },
      {
        "name": "Decline Chest Press",
        "sets": [
          {"weight": 12.5, "reps": 18},
          {"weight": 12.5, "reps": 18},
          {"weight": 12.5, "reps": 18}
        ]
      },
      {
        "name": "Dead Bug (Same Side)",
        "sets": [
          {"weight": 0, "reps": 20},
          {"weight": 0, "reps": 20},
          {"weight": 0, "reps": 20}
        ]
      }
    ]
  }
];
