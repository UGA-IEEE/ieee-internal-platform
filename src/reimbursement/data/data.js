// Contact info and financial account numbers are pulled from env vars (see .env.example)
// so real values never live in this git-tracked file.
export const MEMBERS = [
  {
    id: 'jun',
    name: 'John Chambers',
    email: import.meta.env.VITE_MEMBER_JUN_EMAIL || '',
    phone: import.meta.env.VITE_MEMBER_JUN_PHONE || '',
    street: import.meta.env.VITE_MEMBER_JUN_STREET || '',
    city: import.meta.env.VITE_MEMBER_JUN_CITY || '',
    zip: import.meta.env.VITE_MEMBER_JUN_ZIP || '',
    signature: 'jun_chambers.png',
    role: 'President',
  },
  {
    id: 'sid',
    name: 'Sidney Johnson',
    email: import.meta.env.VITE_MEMBER_SID_EMAIL || '',
    phone: import.meta.env.VITE_MEMBER_SID_PHONE || '',
    street: '',
    city: '',
    zip: '',
    signature: 'sid_johnson.png',
    role: 'Secretary',
  },
  {
    id: 'amber',
    name: 'Amber Juncker',
    email: '',
    phone: '',
    street: '',
    city: '',
    zip: '',
    signature: 'amber_juncker.png',
    role: 'Member',
  },
  {
    id: 'kyle',
    name: 'Kyle Johnsen',
    email: '',
    phone: '',
    street: '',
    city: '',
    zip: '',
    signature: 'kyle_johnsen.png',
    role: 'Faculty Advisor',
  },
];

export const SPEEDTYPES = {
  studentActivity: { label: 'Student Activity Account', value: import.meta.env.VITE_SPEEDTYPE_STUDENT_ACTIVITY || '' },
  agency:          { label: 'Agency Account',           value: import.meta.env.VITE_SPEEDTYPE_AGENCY || '' },
  foundation:      { label: 'Foundation Account',       value: import.meta.env.VITE_SPEEDTYPE_FOUNDATION || '' },
};

export const ORG = {
  name:         'Institute of Electrical and Electronics Engineers',
  shortName:    'IEEE',
  departmentId: import.meta.env.VITE_SPEEDTYPE_STUDENT_ACTIVITY || '',
};
