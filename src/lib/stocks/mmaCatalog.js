export const ALL_MMA = new Set([
   
    'ABS_RAW', 
    'ABS_SCREENED',

    'PSS_SCREENED', 
    'PSS_SORTED',
    
    'KEF_SORTED',
  ]);
  
  export function assertValidMma(mmaCode) {
    if (!ALL_MMA.has(String(mmaCode))) throw new Error(`Unknown mmaCode: ${mmaCode}`);
  }
  