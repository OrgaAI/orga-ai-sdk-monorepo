// sdk-react-native/src/OrgaAIProvider.tsx
import React from 'react';
import { createOrgaAIProvider } from '@orga-ai-sdk/shared';
import { useOrgaAI } from './useOrgaAI';
import type { OrgaAIHookReturn } from '../types';

const { OrgaAIProvider: SharedOrgaAIProvider, useOrgaAIContext } = createOrgaAIProvider<OrgaAIHookReturn>();

// This wrapper hides the useOrgaAI prop from consumers
export const OrgaAIProvider = (props: Omit<React.ComponentProps<typeof SharedOrgaAIProvider>, 'useOrgaAI'>) => (
  <SharedOrgaAIProvider {...props} useOrgaAI={useOrgaAI} />
);

export { useOrgaAIContext }; 