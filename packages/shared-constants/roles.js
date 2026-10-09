export const ROLES = {
  STUDENT: 'student',
  RECRUITER: 'recruiter',
  PLACEMENT_OFFICER: 'placement_officer',
  ALUMNI: 'alumni',
  ADMIN: 'admin'
};

export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 100,
  [ROLES.PLACEMENT_OFFICER]: 80,
  [ROLES.RECRUITER]: 60,
  [ROLES.ALUMNI]: 20,
  [ROLES.STUDENT]: 10
};
