import { SkillNode } from '../models/SkillNode.js';

export const getSkillTree = async (req, res, next) => {
  try {
    let nodes = await SkillNode.find();
    
    if (nodes.length === 0) {
      nodes = [
        { _id: '1', courseCode: 'CS101', courseName: 'Introduction to Programming', credits: 4, difficulty: 'Beginner', prerequisites: [], category: 'Core' },
        { _id: '2', courseCode: 'CS102', courseName: 'Data Structures', credits: 4, difficulty: 'Intermediate', prerequisites: ['CS101'], category: 'Core' },
        { _id: '3', courseCode: 'CS201', courseName: 'Algorithms', credits: 4, difficulty: 'Advanced', prerequisites: ['CS102'], category: 'Core' },
        { _id: '4', courseCode: 'CS202', courseName: 'Database Systems', credits: 3, difficulty: 'Intermediate', prerequisites: ['CS102'], category: 'Core' },
        { _id: '5', courseCode: 'CS301', courseName: 'Operating Systems', credits: 4, difficulty: 'Advanced', prerequisites: ['CS102', 'CS201'], category: 'Core' },
        { _id: '6', courseCode: 'CS401', courseName: 'Machine Learning', credits: 3, difficulty: 'Boss', prerequisites: ['CS201'], category: 'Elective' }
      ];
    }
    
    res.status(200).json({ success: true, data: nodes });
  } catch (error) {
    next(error);
  }
};

export const addNode = async (req, res, next) => {
  try {
    const node = await SkillNode.create(req.body);
    res.status(201).json({ success: true, data: node });
  } catch (error) {
    next(error);
  }
};
