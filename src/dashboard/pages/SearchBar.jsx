const SearchBar = ({ placeholder = "Search...", searchQuery, setSearchQuery, onSearch }) => {
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchClick = () => {
    onSearch(); // Trigger search only on button click
  };

  return (
    <div className="search-bar" style={{ display: "flex", gap: "10px" }}>
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleInputChange}
        className="form-control"
      />
      <button className="btn btn-primary" onClick={handleSearchClick}>
        Search
      </button>
    </div>
  );
};

export default SearchBar;
