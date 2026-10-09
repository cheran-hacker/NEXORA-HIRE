# NEXORA Student Database Audit

## Existing Architecture Overview
The current NEXORA application stores the majority of student information inside a massive embedded `studentProfile` object within the `User.js` model. While this works for prototyping, it poses scalability and normalization issues as the application grows.

## Problems Found
1. **Unnormalized Skills**: Skills are currently stored as `[String]` inside `User.studentProfile`. This leads to inconsistent data (e.g., "react", "ReactJS", "REACT") which breaks the accuracy of the `RoleSkillMap` Job Matching engine.
2. **Career Targets Embedded**: `targetCareerRole` is a simple string inside the `User` model, making it difficult to expand into multi-role tracking or preferred locations without bloating the User document.
3. **Resume Bloat**: While `ResumeAnalysis.js` exists, some resume URL references are duplicated in the `User` model.
4. **Missing Saved Jobs Model**: Students currently lack a normalized way to save jobs without applying.
5. **Heavy Dashboard Endpoint**: `studentController.js -> getStudentStats` performs complex AI calculations on-the-fly and iterates over string arrays. Normalizing skills will allow for faster, indexed queries.

## Changes Planned
- Extract `skills` into `Skill.js` and `StudentSkill.js`.
- Extract `targetCareerRole` into `CareerTarget.js`.
- Create `SavedJob.js`.
- Create a safe data migration script (`migrateStudentData.js`) to migrate existing string skills into the new relational collections.
- Refactor `studentController.js` to utilize the new relational collections while preserving backward compatibility with the frontend UI.

## Migration Strategy
1. **Preserve Data**: No documents will be dropped.
2. **Map Fields**: Read `user.studentProfile.skills`, upsert into `Skill`, insert into `StudentSkill`.
3. **Map Career**: Read `user.studentProfile.targetCareerRole`, insert into `CareerTarget`.
4. **Cleanup**: Only after successful migration will the legacy fields in `User.js` be deprecated.
