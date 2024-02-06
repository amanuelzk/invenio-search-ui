import React, { useState, useEffect } from "react";
import { Dropdown } from "semantic-ui-react";
import { http } from "react-invenio-forms";
import _ from "lodash";

export const StumbleNav = () => {
  window.sendToReactComponent = (selectedValue) => {
    const pathname = new URL(window.location.href).pathname;
    const parts = pathname.split("/");
    if (
      window.location.href ===
      `https://gresis.osc.int/records/${parts[parts.length - 1]}`
    ) {
      console.log("Selected value in React:", selectedValue);
      translateLanguage(selectedValue);
    } else {
      handleOptionChange(selectedValue);
    }
  };
  const [selectedOption, setSelectedOption] = useState(null);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const processResponse = (response) => {
    if (response && response.hits) {
      const hitsArray = response.hits.hits;
      setData(hitsArray);
      for (const hit of hitsArray) {
        const id = hit.id;
        const title = hit.metadata.title;
        console.log(`ID: ${id}, Title: ${title}`);
      }
    } else {
      console.error("No 'hits' property found in the response");
    }
  };
  const translateLanguage = async (selectedValue) => {
    console.log(selectedValue);
    const data = {
      // send the data
      value: selectedValue,
    };

    await http
      .post("https://gresis.osc.int/api/records/translate", data, {
        h: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        withCredentials: true,
      })
      .then((resp) => {
        console.log(resp);
      });
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

  const handleOptionChange = async (value) => {
    setSelectedOption(value);

    if (value === "publication") {
      await fetchData(
        "https://gresis.osc.int/api/records?q=&sort=newest&page=1&size=10&resource_type=publication"
      );
      const shuffle = _.shuffle(data.map((obj) => obj.id));
      window.location = `/records/${shuffle[0]}`;
    } else if (value === "Audio/Video") {
      await fetchData(
        "https://gresis.osc.int/api/records?q=&sort=newest&page=1&size=10&resource_type=video"
      );
      const shuffle = _.shuffle(data.map((obj) => obj.id));
      window.location = `/records/${shuffle[0]}`;
    } else {
      await fetchData(
        "https://gresis.osc.int/api/records?q=&sort=newest&page=1&size=10"
      );
      const shuffle = _.shuffle(data.map((obj) => obj.id));
      window.location = `/records/${shuffle[0]}`;
    }
  };

  return <div></div>;
};
