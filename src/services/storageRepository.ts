import { Project } from '../types/project';

const STORAGE_KEY_PREFIX = 'buildverse_project_';
const PROJECT_INDEX_KEY = 'buildverse_project_index';

export interface ProjectIndexItem {
  id: string;
  name: string;
  type: string;
  location: string;
  plotArea: number;
  budget: number;
  updatedAt: string;
}

export class StorageRepository {
  /**
   * Retrieves list of all locally saved projects
   */
  static listProjects(): ProjectIndexItem[] {
    try {
      const indexJson = localStorage.getItem(PROJECT_INDEX_KEY);
      if (!indexJson) return [];
      return JSON.parse(indexJson);
    } catch (e) {
      console.error('Failed to load project index:', e);
      return [];
    }
  }

  /**
   * Saves or updates a project in local storage
   */
  static saveProject(project: Project): boolean {
    try {
      project.updatedAt = new Date().toISOString();
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${project.id}`, JSON.stringify(project));

      // Update index
      const index = this.listProjects();
      const existingIdx = index.findIndex((p) => p.id === project.id);
      const indexItem: ProjectIndexItem = {
        id: project.id,
        name: project.name,
        type: project.type,
        location: project.metadata.location,
        plotArea: project.metadata.plotArea,
        budget: project.metadata.budget,
        updatedAt: project.updatedAt,
      };

      if (existingIdx >= 0) {
        index[existingIdx] = indexItem;
      } else {
        index.unshift(indexItem);
      }

      localStorage.setItem(PROJECT_INDEX_KEY, JSON.stringify(index));
      return true;
    } catch (e) {
      console.error('Failed to save project:', e);
      return false;
    }
  }

  /**
   * Loads a project by ID from local storage
   */
  static loadProject(id: string): Project | null {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
      if (!data) return null;
      return JSON.parse(data) as Project;
    } catch (e) {
      console.error(`Failed to load project ${id}:`, e);
      return null;
    }
  }

  /**
   * Deletes a project by ID
   */
  static deleteProject(id: string): boolean {
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
      const index = this.listProjects().filter((p) => p.id !== id);
      localStorage.setItem(PROJECT_INDEX_KEY, JSON.stringify(index));
      return true;
    } catch (e) {
      console.error(`Failed to delete project ${id}:`, e);
      return false;
    }
  }

  /**
   * Exports project as downloadable JSON file
   */
  static exportProjectJSON(project: Project): void {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.name.toLowerCase().replace(/\s+/g, '_')}_buildverse.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}
