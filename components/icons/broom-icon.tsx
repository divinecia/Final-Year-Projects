
import * as React from 'react';

export const BroomIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M14 8h2" />
    <path d="M8 14v-5h2v5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-5h2" />
    <path d="M12 18v-4" />
    <path d="M3.5 14.5a7 7 0 1 0 7-7" />
  </svg>
);
