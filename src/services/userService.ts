import { AuthorizedUser } from '../types';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1RGPHYZEgAbkYhCApHTHW5xb_ZUSo8HC6ukMMLVrQliU/gviz/tq?tqx=out:csv&sheet=Sheet1';

export const userService = {
  login: async (userId: string, password: string): Promise<AuthorizedUser | null> => {
    try {
      const response = await fetch(SHEET_URL);
      if (!response.ok) throw new Error('Could not fetch user database');
      
      const csvText = await response.text();
      const rows = csvText.split('\n').map(row => 
        row.split(',').map(cell => cell.replace(/^"(.*)"$/, '$1').trim())
      );

      // Skip header row
      for (let i = 1; i < rows.length; i++) {
        const [sheetUserId, sheetPassword, name] = rows[i];
        if (sheetUserId?.trim() === userId.trim() && sheetPassword?.trim() === password.trim()) {
          return {
            userId: sheetUserId.trim(),
            password: sheetPassword.trim(),
            name: (name || sheetUserId).trim(),
            updatedAt: Date.now()
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }
};
