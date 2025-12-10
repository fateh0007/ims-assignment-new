
const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// get all courses
router.get('/', async (req,res)=>{
  const courses = await Course.find().sort({createdAt:-1});
  res.json(courses);
});

// get course by slug (course page + LMS)
router.get('/:slug', async (req,res)=>{
  const c = await Course.findOne({ slug: req.params.slug });
  if (!c) return res.status(404).json({error:'Not found'});
  res.json(c);
});

// admin create course (simple, no auth)
router.post('/', async (req,res)=>{
  try {
    const course = new Course(req.body);
    await course.save();
    res.json(course);
  } catch(err){
    res.status(400).json({error: err.message});
  }
});

module.exports = router;
