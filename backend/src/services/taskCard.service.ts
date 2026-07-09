import { taskCardRepository } from '../repositories/taskCard.repository.js';
import { cohortRepository } from '../repositories/cohort.repository.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../errors/index.js';

function getWeekWorkdays(weekStart: Date): Date[] {
  const days: Date[] = [];
  const cursor = new Date(weekStart);
  for (let i = 0; i < 5; i++) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export const taskCardService = {
  async getWeekGrid(
    cohortId: string,
    weekStartStr: string,
    userId: string,
    userRole: string,
    all: boolean,
  ) {
    const cohort = await cohortRepository.findById(cohortId);
    if (!cohort) throw new NotFoundError('Cohort not found');

    const weekStart = new Date(weekStartStr);
    if (isNaN(weekStart.getTime())) {
      throw new ValidationError('Invalid weekStart date');
    }

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const workdays = getWeekWorkdays(weekStart);

    // Filter workdays to stay within cohort practice period
    const validWorkdays = workdays.filter(
      (d) => d >= cohort.practiceStart && d <= cohort.practiceEnd,
    );

    // If no valid workdays, return empty
    if (validWorkdays.length === 0) {
      return { weekStart: weekStartStr, workdays: [] };
    }

    const from = validWorkdays[0];
    const to = validWorkdays[validWorkdays.length - 1];

    let tasks;
    if (all && userRole === 'ADMIN') {
      tasks = await taskCardRepository.findByCohortAndRange(cohortId, from, to);
    } else {
      tasks = await taskCardRepository.findByUserAndRange(userId, cohortId, from, to);
    }

    // Build workdays with their tasks
    const workdaysWithTasks = validWorkdays.map((day) => {
      const dayStr = day.toISOString().split('T')[0];
      const dayTasks = tasks.filter((t) => {
        const tDayStr = t.date.toISOString().split('T')[0];
        return tDayStr === dayStr;
      });
      return {
        date: day.toISOString().split('T')[0],
        tasks: dayTasks,
      };
    });

    return {
      weekStart: weekStartStr,
      cohortName: cohort.name,
      workdays: workdaysWithTasks,
    };
  },

  async create(data: {
    userId: string;
    cohortId: string;
    date: string;
    title: string;
    description?: string;
    artifactLink?: string;
  }) {
    const cohort = await cohortRepository.findById(data.cohortId);
    if (!cohort) throw new NotFoundError('Cohort not found');

    const taskDate = new Date(data.date);
    if (isNaN(taskDate.getTime())) {
      throw new ValidationError('Invalid date');
    }

    // Validate date is within practice period and is a workday (Mon-Fri)
    if (taskDate < cohort.practiceStart || taskDate > cohort.practiceEnd) {
      throw new ValidationError('Date is outside the practice period');
    }
    const dayOfWeek = taskDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      throw new ValidationError('Tasks can only be created for workdays (Mon-Fri)');
    }

    return taskCardRepository.create({
      userId: data.userId,
      cohortId: data.cohortId,
      date: taskDate,
      title: data.title,
      description: data.description,
      artifactLink: data.artifactLink,
    });
  },

  async update(id: string, userId: string, userRole: string, data: {
    title?: string;
    description?: string;
    artifactLink?: string;
  }) {
    const task = await taskCardRepository.findById(id);
    if (!task) throw new NotFoundError('Task not found');

    if (userRole !== 'ADMIN' && task.userId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    return taskCardRepository.update(id, data);
  },

  async delete(id: string, userId: string, userRole: string) {
    const task = await taskCardRepository.findById(id);
    if (!task) throw new NotFoundError('Task not found');

    if (userRole !== 'ADMIN' && task.userId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    return taskCardRepository.delete(id);
  },
};