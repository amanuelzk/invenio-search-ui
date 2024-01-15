// This file is part of InvenioRDM
// Copyright (C) 2022 CERN.
// Invenio Search Ui is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_search_ui/i18next";
import React from "react";
import {
  Button,
  Card,
  List,
  Dropdown
} from "semantic-ui-react";
import Overridable from "react-overridable";
import PropTypes from "prop-types";
import { BucketAggregation, Toggle, buildUID } from "react-searchkit";

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

      {aggs.map((agg) => {
        return (
          <div className="facet-container" key={agg.title}>
            <BucketAggregation title={agg.title} agg={agg} />
          </div>
        );
      })}
      {help && (
        <Card className="borderless facet mt-0">
          <Card.Content>
            <Card.Header as="h2">{i18next.t("Help")}</Card.Header>
            <ContribSearchHelpLinks appName={appName}/>
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
  onFilterClicked,
  options,  
}) => {
  return (
    <>
    <Dropdown
      options={options}
      aria-label={bucket.label || keyField}
      value={keyField}
      selection
      onChange={(e, { value }) => onFilterClicked(value)}
    />
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
  onFilterClicked,
  options,  
}) => {
  return (
    <>
      <Dropdown
      options={options}
      aria-label={bucket.label || keyField}
      value={keyField}
      selection
      onChange={(e, { value }) => onFilterClicked(value)}
    />
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
  bucketLabels
}) => {
  const hasChildren = childAggCmps && childAggCmps.props.buckets.length > 0;
  const keyField = bucket.key_as_string ? bucket.key_as_string : bucket.key;
  const options=[{ key: keyField, value: keyField, text: bucket.label || keyField }];

  return (
    <>
      {hasChildren ? (
        <ContribParentFacetValue
          bucket={bucket}
          keyField={keyField}
          isSelected={isSelected}
          childAggCmps={childAggCmps}
          onFilterClicked={onFilterClicked}
          bucketLabels={bucketLabels}
          options={options}
        />
      ) : (
        <ContribFacetValue
          bucket={bucket}
          keyField={keyField}
          isSelected={isSelected}
          onFilterClicked={onFilterClicked}
          bucketLabels={bucketLabels}
          options={options}
        />
      )}
    </>
  );
};

ContribBucketAggregationValuesElement.propTypes = {
  bucket: PropTypes.object.isRequired,
  childAggCmps: PropTypes.node,
  isSelected: PropTypes.bool.isRequired,
  onFilterClicked: PropTypes.func.isRequired,
  bucketLabels: PropTypes.array
};

ContribBucketAggregationValuesElement.defaultProps = {
  bucketLabels: null,
  containerCmp: null
};

export const ContribBucketAggregationElement = ({
  agg,
  title,
  containerCmp,
  updateQueryFilters,
}) => {
  const clearFacets = () => {
    if (containerCmp.props.selectedFilters.length) {
      updateQueryFilters([agg.aggName, ""], containerCmp.props.selectedFilters);
    }
  };

  const hasSelections = () => {
    return !!containerCmp.props.selectedFilters.length;
  };

  const options = containerCmp.props.buckets.map(bucket => ({
    key: bucket.key,
    value: bucket.key, 
    text: bucket.label,
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
              aria-label={i18next.t("Clear selection")}
              title={i18next.t("Clear selection")}
            >
              {i18next.t("Clear")}
            </Button>
          )}
        </Card.Header>
        <Dropdown
          options={options}
          value={containerCmp.props.selectedFilters.map(filter => filter.value)}
          selection
          onChange={(e, { value }) => updateQueryFilters([agg.aggName, value], containerCmp.props.selectedFilters)}
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
  options: PropTypes.array
};

ContribBucketAggregationElement.defaultProps = {
  options: null,
  containerCmp: null
};
