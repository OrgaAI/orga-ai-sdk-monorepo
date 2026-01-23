import path from 'path';
import fs from 'fs/promises';
import { homeContent } from './screens/Home';
import { layoutContent } from './screens/layout';
import { providerContent } from './screens/Provider';
import { apiContent } from './screens/API';
import { envContent } from './screens/EnvFile';
import { readmeContent } from './screens/README';
import { Logger } from './utils/logger';

export async function configureProject(projectDir: string) {
    Logger.step('Configuring project files...');
  
    try {
      const pageFile = path.join(projectDir, 'app/page.tsx');
      await fs.writeFile(pageFile, homeContent);
      Logger.success('Created app/page.tsx');
    
      const layoutFile = path.join(projectDir, 'app/layout.tsx');
      await fs.writeFile(layoutFile, layoutContent);
      Logger.success('Created app/layout.tsx');
    
      const providersDir = path.join(projectDir, 'app/providers');
      await fs.mkdir(providersDir, { recursive: true });
      const providerFile = path.join(providersDir, 'OrgaProvider.tsx');
      await fs.writeFile(providerFile, providerContent);
      Logger.success('Created app/providers/OrgaProvider.tsx');
    
      const apiDir = path.join(projectDir, 'app/api');
      await fs.mkdir(apiDir, { recursive: true });
      const apiRouteFile = path.join(apiDir, 'route.ts');
      await fs.writeFile(apiRouteFile, apiContent);
      Logger.success('Created app/api/route.ts');
    
      const envFile = path.join(projectDir, '.env.local');
      await fs.writeFile(envFile, envContent);
      Logger.success('Created .env.local file');
    
      const readmeFile = path.join(projectDir, 'README.md');
      await fs.writeFile(readmeFile, readmeContent);
      Logger.success('Created README.md');
    } catch (error) {
      Logger.error(`Failed to configure project: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }