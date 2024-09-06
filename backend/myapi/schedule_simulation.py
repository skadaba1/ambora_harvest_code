import pulp

# Define tasks for each day as (duration in hours, workers required) – may differ per day
tasks_per_day = {
    0:  [(1, 1), (0.5, 1), (4, 2), (0.5, 1)],
    1:  [(1, 1), (0.5, 1), (1.5, 2), [[(1.5, 2), (1, 2), (1.5, 2), (1, 2), (1, 2)], [(0.5, 2), (2.5, 2)]], (1, 2), (0.5, 1)],         # Tasks for Day 1
    2:  [(1, 1), (0.5, 1) (1.5, 2), (1, 2), (0.5, 1)],
    4:  [(1, 1), (0.5, 1), (1.5, 2), (0.5, 1)],
    8:  [(1, 1), (0.5, 1), (1.5, 2), (0.5, 1)],
    10: [(1, 1), (0.5, 1), (0.5, 2), (1.5, 2), [[(2.5, 2), (1, 2)], [(1.5, 2), (1, 2), (1, 2), (1.5, 2)], [(0.5, 2), (0.5, 2), (3, 2)]], (0.5, 1)]
}
num_batches = 5  # Number of batches
num_days = 11  # Each batch spans 11 days
working_hours_per_day = 10.5  # 7:30 AM to 6 PM (10.5 hours)

# Initialize a Linear Programming problem
problem = pulp.LpProblem("Minimize_Maximum_Workers", pulp.LpMinimize)

# Decision variables: start time of each task in each batch for each day
start_time = pulp.LpVariable.dicts("start_time",
                                   [(batch, task, day) for batch in range(num_batches) 
                                                        for day in range(num_days) 
                                                        for task in range(len(tasks_per_day.get(day, [])))],
                                   lowBound=0, upBound=working_hours_per_day, cat='Continuous')

# Variable representing the maximum number of workers required across all tasks
max_workers = pulp.LpVariable("max_workers", lowBound=0, cat='Integer')

# Objective: minimize the maximum number of workers required across all tasks
problem += max_workers, "Minimize_Maximum_Workers"

# Constraints: Ensure that tasks within the same batch for a given day do not overlap (sequential execution within a day)
for batch in range(num_batches):
    for day in range(num_days):
        tasks = tasks_per_day.get(day, [])
        for task in range(len(tasks) - 1):
            duration, _ = tasks[task]
            # Ensure that the next task starts after the current task ends (within the same day)
            problem += start_time[(batch, task + 1, day)] >= start_time[(batch, task, day)] + duration, \
                       f"No_Overlap_Batch_{batch}_Task_{task}_Day_{day}"
            # Ensure all tasks start and finish within the day
            problem += start_time[(batch, task, day)] + duration <= working_hours_per_day, \
                       f"Task_Finish_Within_Day_Batch_{batch}_Task_{task}_Day_{day}"

# Constraints: Ensure the maximum number of workers is respected at any given time across all batches and days
for day in range(num_days):
    tasks = tasks_per_day.get(day, [])
    for hour in range(int(working_hours_per_day)):
        total_workers = pulp.lpSum(
            workers
            for batch in range(num_batches)
            for task, (duration, workers) in enumerate(tasks)
            if hour >= pulp.value(start_time[(batch, task, day)]) and hour < pulp.value(start_time[(batch, task, day)]) + duration
        )
        problem += total_workers <= max_workers, f"Max_Workers_Constraint_Day_{day}_Hour_{hour}"

# Solve the problem
problem.solve()

# Output results
print(f"Maximum workers required across all tasks: {pulp.value(max_workers)}")
for batch in range(num_batches):
    print(f"Batch {batch}:")
    for day in range(num_days):
        tasks = tasks_per_day.get(day, [])
        for task in range(len(tasks)):
            start = pulp.value(start_time[(batch, task, day)])
            duration, workers = tasks[task]
            if start is not None:
                print(f"  Day {day}, Task {task}: Start = {start}, Duration = {duration}, Workers = {workers}")