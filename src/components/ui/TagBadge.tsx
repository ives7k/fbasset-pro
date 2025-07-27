import React from 'react';

interface TagBadgeProps {
  tag: string;
}

const TagBadge: React.FC<TagBadgeProps> = ({ tag }) => {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#0B1120]/80 text-white border border-indigo-500/10">
      {tag}
    </span>
  );
};

export default TagBadge;