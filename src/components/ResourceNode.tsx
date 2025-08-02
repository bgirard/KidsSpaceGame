import React from 'react';
import { ResourceNode as ResourceNodeType, RESOURCE_CONFIG } from '../types/GameTypes';
import './ResourceNode.css';

interface ResourceNodeProps {
  node: ResourceNodeType;
  isBeingCollected?: boolean;
}

const ResourceNode: React.FC<ResourceNodeProps> = ({ node, isBeingCollected = false }) => {
  const config = RESOURCE_CONFIG[node.type];
  const fillPercentage = (node.amount / node.maxAmount) * 100;
  
  return (
    <div 
      className={`resource-node ${isBeingCollected ? 'collecting' : ''}`}
      style={{
        left: node.position.x,
        top: node.position.y,
        '--glow-color': config.glowColor,
        '--fill-percentage': `${fillPercentage}%`
      } as React.CSSProperties}
    >
      <div className="resource-icon">{config.emoji}</div>
      <div className="resource-bar">
        <div 
          className="resource-fill"
          style={{ 
            backgroundColor: config.color,
            width: `${fillPercentage}%`
          }}
        />
      </div>
      <div className="resource-amount">{Math.floor(node.amount)}</div>
    </div>
  );
};

export default ResourceNode;