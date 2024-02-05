import React, { useState, useEffect } from "react";
import { Dropdown } from "semantic-ui-react";
import { http } from "react-invenio-forms";
import _ from 'lodash';

export const Stumble = () => {
  window.sendToReactComponent = (selectedValue) => {
    handleOptionChange(selectedValue)
    console.log('Selected value in React:', selectedValue);
  };
  const [selectedOption, setSelectedOption] = useState(null);
  const [data, setData] = useState( [] );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const processResponse = (response) => {
    if (response && response.hits) {
      const hitsArray = response.hits.hits;
      setData(hitsArray)
      for (const hit of hitsArray) {
        const id = hit.id;
        const title = hit.metadata.title;
        console.log(`ID: ${id}, Title: ${title}`);
      }
    } else {
      console.error("No 'hits' property found in the response");
    }
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
      setError(error.response?.data?.message || 'An error occurred');
      setIsLoading(false);
    }
  };

  const handleOptionChange = async (value) => {
    setSelectedOption(value);

  
    if (value === "publication") {
      await fetchData('  https://127.0.0.1:5000/api/records?q=&sort=newest&page=1&size=10&resource_type=publication');
      const shuffle = _.shuffle(data.map(obj => obj.id));
      window.location = `/records/${shuffle[0]}`;
    } else if (value === "Audio/Video") {
      await fetchData('https://127.0.0.1:5000/api/records?q=&sort=newest&page=1&size=10&resource_type=video');
      const shuffle = _.shuffle(data.map(obj => obj.id));
      window.location = `/records/${shuffle[0]}`;
    } else {
      await fetchData('https://127.0.0.1:5000/api/records?q=&sort=newest&page=1&size=10');
      const shuffle = _.shuffle(data.map(obj => obj.id));
      window.location = `/records/${shuffle[0]}`;
    }
  };

  return (
    <div>
      
    
    </div>
  );
};
