import React, { useState, useEffect, useMemo } from 'react';
import { ExchangeAlt } from '@styled-icons/fa-solid/ExchangeAlt';
import { Equals } from '@styled-icons/fa-solid/Equals';

import api from '../../services/api';
import * as S from './styles';

import currencies from './currencies';
import { parseNumber, formatNumber } from './parser';

const Searcher = () => {
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('BRL');
  const [fromValue, setFromValue] = useState(1);
  const [toValue, setToValue] = useState(0);
  const [exchangeRates, setExchangeRates] = useState({});

  const currenciesOptions = currencies.map(currency => ({
    value: currency,
    label: currency,
  }));

  const displayValue = useMemo(
    () =>
      new Intl.NumberFormat('us-EN', {
        style: 'currency',
        currency: to,
      }).format(toValue),
    [toValue, to]
  );

  useEffect(() => {
    async function getExchangeRates() {
      try {
        const response = await api.get(`/latest?base=${from}`);
        const { rates } = response.data;
        setExchangeRates(rates);
        if (to && fromValue) {
          setToValue(convert(rates[to], parseNumber(fromValue)));
          setFromValue(formatNumber(fromValue, from));
        }
      } catch (e) {}
    }
    getExchangeRates();
  }, [from]);

  function handleFromChange({ value }) {
    setFrom(value);
  }
  function handleToChange({ value }) {
    setTo(value);
    if (fromValue) {
      setToValue(convert(exchangeRates[value], parseNumber(fromValue)));
    }
  }

  function parseFromValue({ target: { value } }) {
    value = parseNumber(value);
    value = `${value}`.replace(/\./g, ',');
    setFromValue(value);
  }

  function handleFromFieldChange({ target: { value } }) {
    let display = `${value}`.replace(/\./g, ',');
    setFromValue(display);

    let parsed = `${value}`.replace(/\./g, '');
    parsed = parsed.replace(/,/g, '.');

    setToValue(convert(exchangeRates[to], parsed));
  }
  function formatFromValue() {
    setFromValue(formatNumber(fromValue, from));
  }
  function convert(a, b) {
    let converted = parseFloat(a) * parseFloat(b);
    if (!converted) {
      converted = 0;
    }
    return converted.toFixed(2);
  }
  function switchCurrency() {
    let aux = from;
    setFrom(to);
    setTo(aux);
  }
  return (
    <S.SearcherWrapper>
      <S.ControlsContainer>
        <S.SearcherSelect
          options={currenciesOptions}
          defaultValue={{ value: from, label: from }}
          value={{ value: from, label: from }}
          onChange={handleFromChange}
        />
        <S.SearcherButton onClick={switchCurrency}>
          <ExchangeAlt size={24} color="#f7f6f3" />
        </S.SearcherButton>
        <S.SearcherSelect
          options={currenciesOptions}
          onChange={handleToChange}
          value={{ value: to, label: to }}
          defaultValue={{ value: to, label: to }}
        />
      </S.ControlsContainer>
      <S.FieldsContainer>
        <S.SearcherField
          value={fromValue}
          onChange={handleFromFieldChange}
          onFocus={parseFromValue}
          onBlur={formatFromValue}
        />
        <Equals size={48} color="white" />

        <S.ConvertedValueLabel>{displayValue}</S.ConvertedValueLabel>
      </S.FieldsContainer>
    </S.SearcherWrapper>
  );
};

export default Searcher;
