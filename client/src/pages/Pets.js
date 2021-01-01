import React, { useState } from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import PetsList from '../components/PetsList';
import NewPetModal from '../components/NewPetModal';
import Loader from '../components/Loader';

const ALL_PETS = gql`
  query AllPets {
    pets {
      id
      name
      type
      img
    }
  }
`;

export default function Pets() {
  const [modal, setModal] = useState(false);
  // NOTE: `useQuery` takes in an argument, which is a GraphQL query - it returns an Object:
  const { data, loading, error } = useQuery(ALL_PETS);
  // NOTE: `useMutation` returns an Array - it does NOT run a mutation, we have to call the function (in this case `createPet`) to trigger a mutation:
  // NOTE: the second object in the left-hand-side array is an Object with `data`, `loading` and `error` (like in the case of `useQuery` above)
  const [createPet, newPet] = useMutation(...mutation);

  const onSubmit = (input) => {
    setModal(false);
    // NOTE: we pass our Query Variables to this function to use and actually trigger a mutation:
    createPet({});
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <p>Error!</p>;
  }

  if (modal) {
    return <NewPetModal onSubmit={onSubmit} onCancel={() => setModal(false)} />;
  }

  return (
    <div className='page pets-page'>
      <section>
        <div className='row betwee-xs middle-xs'>
          <div className='col-xs-10'>
            <h1>Pets</h1>
          </div>

          <div className='col-xs-2'>
            <button onClick={() => setModal(true)}>new pet</button>
          </div>
        </div>
      </section>
      <section>
        <PetsList pets={data.pets} />
      </section>
    </div>
  );
}
