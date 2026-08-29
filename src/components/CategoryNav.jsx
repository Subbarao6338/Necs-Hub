import React from 'react';

const CategoryNav = ({ categories, activeCategory, setActiveCategory, showStats, stats, totalCount, extraCategories = [] }) => {
  return (
    <nav className="main-category-nav scrollable-x">
      <a
        href="#All"
        className={`pill ${activeCategory === 'All' ? 'active' : ''}`}
        onClick={() => setActiveCategory('All')}
        style={{ textDecoration: 'none' }}
      >
        <span className="material-icons">home</span>
        <span>All</span>
        {showStats && totalCount !== undefined && <span className="count">{totalCount}</span>}
      </a>

      {extraCategories.map(cat => (
        <a
          key={cat.name}
          href={`#${encodeURIComponent(cat.name)}`}
          className={`pill ${activeCategory === cat.name ? 'active' : ''}`}
          onClick={() => setActiveCategory(cat.name)}
          style={{ textDecoration: 'none' }}
        >
          <span className="material-icons">{cat.icon}</span>
          <span>{cat.name}</span>
          {showStats && cat.count !== undefined && <span className="count">{cat.count}</span>}
        </a>
      ))}

      {Object.keys(categories).sort().filter(c => c !== 'All' && !extraCategories.some(ec => ec.name === c)).map(cat => (
        <a
          key={cat}
          href={`#${encodeURIComponent(cat)}`}
          className={`pill ${activeCategory === cat ? 'active' : ''}`}
          onClick={() => setActiveCategory(cat)}
          style={{ textDecoration: 'none' }}
        >
          <span className="material-icons">{categories[cat] || 'folder'}</span>
          <span>{cat}</span>
          {showStats && stats && stats[cat] > 0 && <span className="count">{stats[cat]}</span>}
        </a>
      ))}
    </nav>
  );
};

export default CategoryNav;
