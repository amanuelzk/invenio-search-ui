import React, { useState, useEffect } from "react";
import { Dropdown } from "semantic-ui-react";
import { http } from "react-invenio-forms";
import _ from "lodash";

export const StumbleNav = () => {
  window.sendToReactComponent = (selectedValue) => {
    const pathname = new URL(window.location.href).pathname;
    const parts = pathname.split("/");
    
      handleOptionChange(selectedValue);
   
  };

  const [selectedOption, setSelectedOption] = useState(null);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      const shuffle = _.shuffle(data.map((obj) => obj.id));
      window.location = `/records/${shuffle[0]}`;
    }
  }, [data]);

  const processResponse = (response) => {
    if (response && response.hits) {
      const hitsArray = response.hits.hits;
      setData(hitsArray);
      
    } else {
      console.error("No 'hits' property found in the response");
    }
  };

  

  const handleOptionChange = async (value) => {
    setSelectedOption(value);

    let apiUrl = "https://127.0.0.1:5000/api/records?q=&sort=newest&page=1&size=10";

    if (value === "publication") {
      apiUrl += "&resource_type=publication";
    } else if (value === "Audio/Video") {
      apiUrl += "&resource_type=video";
    }

    await fetchData(apiUrl);
  };

  const fetchData = async (url) => {
    setIsLoading(true);
    try {
      const response = await http.get(url, {
        headers: {
          Accept: "application/vnd.inveniordm.v1+json",
        },
      });
      const responseData = response.data;

      processResponse(responseData);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "An error occurred");
      setIsLoading(false);
    }
  };

  return <div></div>;
};
