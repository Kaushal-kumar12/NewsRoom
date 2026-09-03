// src/components/navigation/SearchBar.jsx

import React from "react";

import {
  Search,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";


import {
  useApp,
} from "../../context/AppContext";


export default function SearchBar() {


  const {
    search,
    setSearch,
  } = useApp();


  const navigate =
    useNavigate();



  function submit(event) {


    event.preventDefault();


    const value =
      String(search || "")
        .trim();


    if (!value) {

      return;

    }


    navigate(

      `/search?q=${encodeURIComponent(
        value
      )}`

    );

  }



  return (

    <form
      className="search-box"
      onSubmit={submit}
      role="search"
    >


      <Search
        className="search-box-icon"
        size={17}
        strokeWidth={2}
      />



      <input

        type="search"

        value={search}

        onChange={
          (event) =>

            setSearch(
              event.target.value
            )
        }

        placeholder="Search news"

        aria-label="Search news"

      />


    </form>

  );

}