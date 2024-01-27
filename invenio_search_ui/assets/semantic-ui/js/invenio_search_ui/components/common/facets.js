import { i18next } from "@translations/invenio_search_ui/i18next";
import React, { useState } from "react";
import {
  Card,
  List,
  Button,
  Search,
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

function SearchDropdown({ result, onResultSelect }) {
  const [state, dispatch] = React.useReducer(exampleReducer, initialState);
  const { loading, source, value } = state;

  const timeoutRef = React.useRef();

  const handleSearchChange = React.useCallback(
    (e, data) => {
      clearTimeout(timeoutRef.current);
      dispatch({ type: "START_SEARCH", query: data.value });
  
      timeoutRef.current = setTimeout(() => {
  
        const re = new RegExp(_.escapeRegExp(data.value), "i");
        const isMatch = (result) => re.test(result.text);
  
        console.log("Filtered Data:", _.filter(result, isMatch));
        console.log("source:", _.filter(result, isMatch));
        const filteredResults = _.filter(result, isMatch);
  
        dispatch({
          type: "FINISH_SEARCH",
          source: filteredResults,
        });
      }, 300);
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
  }));

  return ( 
    <Search
      loading={loading}
      placeholder="Search..."
      onResultSelect={onResultSelect}
      onSearchChange={handleSearchChange}
      results={formattedResults}
      value={value}
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
  onFilterClicked,
  source,
}) => {
  const [isActive, setIsActive] = useState(false);
  return (
    <SearchDropdown 
      result={source}
      onResultSelect={(e, { result }) => onFilterClicked(result.keyField)}
    />
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
  onFilterClicked,
}) => {
  return (
    <SearchDropdown 
      result={source}
      onResultSelect={(e, { result }) => onFilterClicked(result.keyField)}
    />
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
        />
      ) : (
        <ContribFacetValue
          bucket={bucket}
          keyField={keyField}
          isSelected={isSelected}
          onFilterClicked={onFilterClicked}
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
  const [dispatch] = React.useReducer(exampleReducer, initialState);
  const clearFacets = () => {
    if (containerCmp.props.selectedFilters.length) {
      updateQueryFilters([agg.aggName, ""], containerCmp.props.selectedFilters);
      dispatch({ type: "CLEAN_QUERY" });
      return;
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
        <SearchDropdown
          result={source}
          onResultSelect={(e, { value }) => updateQueryFilters([agg.aggName, value], containerCmp.props.selectedFilters)}
        />
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