import React from 'react';
import { ResourceInventory, RESOURCE_CONFIG, ResourceType } from '../types/GameTypes';
import './ResourceUI.css';

interface ResourceUIProps {
  inventory: ResourceInventory;
}

const ResourceUI: React.FC<ResourceUIProps> = ({ inventory }) => {
  return (
    <div className="resource-ui">
      <h3>Resources</h3>
      <div className="resource-list">
        {Object.entries(inventory).map(([type, amount]) => {
          const resourceType = type as ResourceType;
          const config = RESOURCE_CONFIG[resourceType];
          return (
            <div key={type} className="resource-item">
              <span className="resource-icon">{config.emoji}</span>
              <span className="resource-name">{config.name}</span>
              <span className="resource-count">{Math.floor(amount)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResourceUI;