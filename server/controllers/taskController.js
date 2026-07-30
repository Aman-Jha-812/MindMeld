import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import { sendNotification } from '../services/socketService.js';

export const getTasks = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = { workspace: workspaceId };

    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }
    if (req.query.assignee) {
      filter.assignedTo = req.query.assignee;
    }

    const total = await Task.countDocuments(filter);
    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name avatar')
      .populate('createdBy', 'name avatar')
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GetTasks error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching tasks',
    });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name avatar email')
      .populate('createdBy', 'name avatar email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('GetTaskById error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching task',
    });
  }
};

export const createTask = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { title, description, assignedTo, priority, dueDate, labels, channel, order } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required',
      });
    }

    const task = await Task.create({
      title,
      description,
      workspace: workspaceId,
      channel,
      assignedTo,
      createdBy: req.user._id,
      priority,
      dueDate,
      labels,
      order,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name avatar')
      .populate('createdBy', 'name avatar');

    if (assignedTo) {
      const notification = await Notification.create({
        recipient: assignedTo,
        workspace: workspaceId,
        type: 'task_assigned',
        title: `New task assigned: ${title}`,
        message: description || '',
        data: { taskId: task._id, workspaceId },
      });

      sendNotification(assignedTo, notification);
    }

    res.status(201).json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    console.error('CreateTask error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating task',
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    if (updateData.status === 'completed' && existingTask.status !== 'completed') {
      updateData.completedAt = new Date();
    }

    if (updateData.status !== 'completed') {
      updateData.completedAt = undefined;
    }

    const task = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'name avatar')
      .populate('createdBy', 'name avatar');

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('UpdateTask error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating task',
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted',
    });
  } catch (error) {
    console.error('DeleteTask error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting task',
    });
  }
};

export const reorderTasks = async (req, res) => {
  try {
    const { tasks } = req.body;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tasks array is required',
      });
    }

    const bulkOps = tasks.map(({ id, order, status }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order, ...(status ? { status } : {}) } },
      },
    }));

    await Task.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: 'Tasks reordered',
    });
  } catch (error) {
    console.error('ReorderTasks error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error reordering tasks',
    });
  }
};
