import { i18next } from "@translations/invenio_search_ui/i18next";
import React, { useState } from "react";
import {
  Card,
  List,
  Button,
  Search,
  Accordion,
  Checkbox,
  Label,
} from "semantic-ui-react";
import PropTypes from "prop-types";
import { BucketAggregation, Toggle, buildUID } from "react-searchkit";
import Overridable from "react-overridable";
import _ from "lodash";

const initialState = {
  loading: false,
  source: [],
  value: "",
};

function exampleReducer(state, action) {
  switch (action.type) {
    case "CLEAN_QUERY":
      return initialState;
    case "START_SEARCH":
      return { ...state, loading: true, value: action.query };
    case "FINISH_SEARCH":
      return { ...state, loading: false, source: action.source };
    case "UPDATE_SELECTION":
      return { ...state, value: action.selection };

    default:
      throw new Error();
  }
}

function SearchDropdown({ result, onResultSelect}) {
  const [state, dispatch] = React.useReducer(exampleReducer, initialState);
  const { loading, source, value } = state;

  const timeoutRef = React.useRef();

  const handleSearchChange = React.useCallback(
    (e, data) => {
      clearTimeout(timeoutRef.current);
      let inputValue;

      if (e.target.textContent) {
        inputValue = e.target.textContent.trim();
        console.log("Input value: " + inputValue);
      } else {
        inputValue = data.value.trim();
        console.log("Input value: " + inputValue);
      }

      dispatch({ type: "START_SEARCH", query: inputValue });

      timeoutRef.current = setTimeout(() => {
        if (inputValue !== "") {
          const re = new RegExp(_.escapeRegExp(inputValue), "i");
          const isMatch = (result) => re.test(result.text);

          console.log("Filtered Data:", _.filter(result, isMatch));
          console.log("source:", _.filter(result, isMatch));
          const filteredResults = _.filter(result, isMatch);

          dispatch({
            type: "FINISH_SEARCH",
            source: filteredResults,
          });
        } else {
          const currentURL = window.location.href;

          const urlObject = new URL(currentURL);
          const baseURL = `${urlObject.protocol}//${urlObject.host}${urlObject.pathname}`;

          window.location = `${baseURL}?q=&l=list&p=1&s=10&sort=updated-desc`;
          }
      }, 10);
    },
    [result]
  );
  React.useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const formattedResults = source.map((item) => ({
    title: item.text,
    value: item.text,
  }));

  return ( 
      <Search
        fluid
        loading={loading}
        placeholder="Search..."
        onResultSelect={onResultSelect}
        onSearchChange={handleSearchChange}
        results={formattedResults}
        value={value}
        selectFirstResult
    />
  );
}

export const ContribSearchAppFacets = ({ aggs, toggle, help, appName }) => {
  return (
    <>
      {toggle && (
        <Toggle
          title={i18next.t("Versions")}
          label={i18next.t("View all versions")}
          filterValue={["allversions", "true"]}
        />
      )}
      {aggs.map((agg) => (
        <div className="facet-container" key={agg.title}>
          <BucketAggregation title={agg.title} agg={agg} />
        </div>
      ))}

      {help && (
        <Card className="borderless facet mt-0">
          <Card.Content>
            <Card.Header as="h2">{i18next.t("Help")}</Card.Header>
            <ContribSearchHelpLinks appName={appName} />
          </Card.Content>
        </Card>
      )}
    </>
  );
};

ContribSearchAppFacets.propTypes = {
  aggs: PropTypes.array.isRequired,
  toggle: PropTypes.bool,
  help: PropTypes.bool,
  appName: PropTypes.string,
};

ContribSearchAppFacets.defaultProps = {
  toggle: false,
  help: true,
  appName: "",
};

export const ContribSearchHelpLinks = (props) => {
  const { appName } = props;
  return (
    <Overridable id={buildUID("SearchHelpLinks", "", appName)}>
      <List>
        <List.Item>
          <a href="/help/search">{i18next.t("Search guide")}</a>
        </List.Item>
      </List>
    </Overridable>
  );
};

ContribSearchHelpLinks.propTypes = {
  appName: PropTypes.string,
};

ContribSearchHelpLinks.defaultProps = {
  appName: "",
};

export const ContribParentFacetValue = ({
  bucket,
  keyField,
  childAggCmps,
  isSelected,
  onFilterClicked,
  source,
  showSearchDropdown,
}) => {
  const [isActive, setIsActive] = useState(false);
  return (
    <>
     {showSearchDropdown ? (
      <SearchDropdown
        result={source}
        onResultSelect={(e) => onFilterClicked(e.target.textContent.toLowerCase())}
      />
    ) : (
      <Accordion>
      <Accordion.Title
        onClick={() => { }}
        key={`panel-${bucket.label}`}
        active={isActive}
        className="facet-wrapper parent"
      >
        <List.Content className="facet-wrapper">
          <Button
            icon="angle right"
            className="transparent"
            onClick={() => setIsActive(!isActive)}
            aria-expanded={isActive}
            aria-label={
              i18next.t("Show all sub facets of ") + bucket.label || keyField
            }
          />
          <Checkbox
            label={<label aria-hidden="true">{bucket.label || keyField}</label>}
            aria-label={bucket.label || keyField}
            value={keyField}
            checked={isSelected}
            onClick={() => onFilterClicked(keyField)}
          />
          <Label
            circular
            role="note"
            aria-label={`${bucket.doc_count} results for ${bucket.label || keyField}`}
            className="facet-count"
          >
            <span aria-hidden="true">
              {bucket.doc_count.toLocaleString("en-US")}
            </span>
          </Label>
        </List.Content>
      </Accordion.Title>
      <Accordion.Content active={isActive}>{childAggCmps}</Accordion.Content>
    </Accordion>
    )}
    </>
  );
};

ContribParentFacetValue.propTypes = {
  bucket: PropTypes.object.isRequired,
  keyField: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  childAggCmps: PropTypes.node.isRequired,
  onFilterClicked: PropTypes.func.isRequired,
};

export const ContribFacetValue = ({
  bucket,
  keyField,
  source,
  isSelected,
  onFilterClicked,
  showSearchDropdown,
}) => {
  return (
    <>
     {showSearchDropdown ? (
      <SearchDropdown
        result={source}
        onResultSelect={(e) => onFilterClicked(e.target.textContent.toLowerCase())}
      />
    ) : (
      <List.Content className="facet-wrapper">
      <Checkbox
        onClick={() => onFilterClicked(keyField)}
        label={<label aria-hidden="true">{bucket.label || keyField}</label>}
        aria-label={bucket.label || keyField}
        value={keyField}
        checked={isSelected}
      />
      <Label
        circular
        role="note"
        aria-label={`${bucket.doc_count} results for ${bucket.label || keyField}`}
        className="facet-count"
      >
        <span aria-hidden="true">
          {bucket.doc_count.toLocaleString("en-US")}
        </span>
      </Label>
    </List.Content>
    )}
    </> 
  );
};

ContribFacetValue.propTypes = {
  bucket: PropTypes.object.isRequired,
  keyField: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onFilterClicked: PropTypes.func.isRequired,
};

export const ContribBucketAggregationValuesElement = ({
  bucket,
  isSelected,
  onFilterClicked,
  childAggCmps,
}) => {
  const hasChildren = childAggCmps && childAggCmps.props.buckets.length > 0;
  const keyField = bucket.key_as_string ? bucket.key_as_string : bucket.key;
  return (
    <List.Item key={bucket.key}>
      {hasChildren ? (
        <ContribParentFacetValue
          bucket={bucket}
          keyField={keyField}
          isSelected={isSelected}
          childAggCmps={childAggCmps}
          onFilterClicked={onFilterClicked}
          showSearchDropdown={bucket.label.toLowerCase() === "file type"}
        />
      ) : (
        <ContribFacetValue
          bucket={bucket}
          keyField={keyField}
          isSelected={isSelected}
          onFilterClicked={onFilterClicked}
          showSearchDropdown={bucket.label.toLowerCase() === "file type"}
        />
      )}
    </List.Item>
  );
};

ContribBucketAggregationValuesElement.propTypes = {
  bucket: PropTypes.object.isRequired,
  childAggCmps: PropTypes.node,
  isSelected: PropTypes.bool.isRequired,
  onFilterClicked: PropTypes.func.isRequired,
};

ContribBucketAggregationValuesElement.defaultProps = {
  childAggCmps: null,
};

export const ContribBucketAggregationElement = ({
  agg,
  title,
  containerCmp,
  updateQueryFilters,
}) => {
  const clearFacets = () => {
    const currentURL = window.location.href;

    const urlObject = new URL(currentURL);
    const baseURL = `${urlObject.protocol}//${urlObject.host}${urlObject.pathname}`;

    window.location = `${baseURL}?q=&l=list&p=1&s=10&sort=updated-desc`;

    if (containerCmp.props.selectedFilters.length) {
      updateQueryFilters([agg.aggName, ""], containerCmp.props.selectedFilters);
    }
  };

  const hasSelections = () => {
    return !!containerCmp.props.selectedFilters.length;
  };

  const source = containerCmp.props.buckets.map((filter) => ({
  key: filter.key,
  text: filter.label,
  value: filter.key,
}));

 const showSearchDropdown = title.toLowerCase() === "file type"

  return (
    <Card className="borderless facet">
      <Card.Content>
        <Card.Header as="h2">
          {title}

          {hasSelections() && (
            <Button
              basic
              icon
              size="mini"
              floated="right"
              onClick={clearFacets}
              aria-label="Clear selection"
              title="Clear selection"
            >
              Clear
            </Button>
          )}
        </Card.Header>
      {showSearchDropdown ? (
        <SearchDropdown
          result={source}
          onResultSelect={(e) => {
            updateQueryFilters([agg.aggName, e.target.textContent.toLowerCase()], containerCmp.props.selectedFilters);
          }}
        />
      ): containerCmp}
      </Card.Content>
    </Card>
  );
};

ContribBucketAggregationElement.propTypes = {
  agg: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  containerCmp: PropTypes.node,
  updateQueryFilters: PropTypes.func.isRequired,
  source: PropTypes.array,
};

ContribBucketAggregationElement.defaultProps = {
  containerCmp: null,
  source: null,
};

