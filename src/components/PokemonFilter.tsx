import React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';

import { PokemonType, usePokemonContext } from './Contexts/PokemonProvider';
import PokemonTypeIcon from './PokemonTypeIcon';

type PokemonTypes = Partial<keyof typeof PokemonType>;
const options = Object.keys(PokemonType) as PokemonTypes[];

const ITEM_HEIGHT = 80;
const ITEM_PADDING_TOP = 2;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 100,
    },
  },
};

function PokemonFilter() {
  const { selectedPokemonTypes, setSelectedPokemonTypes } = usePokemonContext();
  const handleChange = (event: SelectChangeEvent<PokemonTypes[]>) => {
    const {
      target: { value },
    } = event;
    setSelectedPokemonTypes(value as PokemonTypes[]);
  };

  return (
    <div>
      <FormControl sx={{ mt: 2, mb: 4, width: 500 }}>
        <InputLabel>Select Type</InputLabel>
        <Select
          labelId='demo-multiple-checkbox-label'
          id='demo-multiple-checkbox'
          multiple
          value={selectedPokemonTypes}
          onChange={handleChange}
          variant='filled'
          sx={{ height: 50 }}
          renderValue={(selected) => selected.join(', ')}
          MenuProps={MenuProps}>
          {options.map((option) => (
            <MenuItem key={option} value={option}>
              <PokemonTypeIcon type={PokemonType[option]} />
              <ListItemText primary={option} sx={{ ml: 2}}/>
              <Checkbox checked={selectedPokemonTypes.indexOf(option) > -1} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

export default PokemonFilter;
