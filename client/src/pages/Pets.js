import React, { useState } from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import PetsList from '../components/PetsList';
import NewPetModal from '../components/NewPetModal';
import Loader from '../components/Loader';

// A Fragment:
// NOTE: we need to call `on` to specify the Type (e.g. here both our query and mutation return a `Pet` type):
// NOTE: how we need to add the fragment to the bottom of the gql tag and then spreading it using the fragment name (NOT the query/mutation object):
const PETS_FIELDS = gql`
  fragment PetsFields on Pet {
    id
    name
    type
    img
    vaccinated @client
    owner {
      id
      age @client
    }
  }
`;

// A Query:
// NOTE: the `@client` directive specifies that this piece of information is coming from client side only (NOT server side!)
// this is how we can use Apollo for our state management(instead of Redux, etc.):
const ALL_PETS = gql`
  query AllPets {
    pets {
      ...PetsFields
    }
  }
  ${PETS_FIELDS}
`;

// A Mutation:
const NEW_PET = gql`
  mutation CreateAPet($newPet: NewPetInput!) {
    addPet(input: $newPet) {
      ...PetsFields
    }
  }
  ${PETS_FIELDS}
`;

export default function Pets() {
  const [modal, setModal] = useState(false);
  // NOTE: `useQuery` takes in an argument, which is a GraphQL query - it returns an Object:
  const { data, loading, error } = useQuery(ALL_PETS);
  // NOTE: `useMutation` returns an Array - it does NOT run a mutation, we have to call the function (in this case `createPet`) to trigger a mutation:
  // NOTE: the second object in the left-hand-side array is an Object with `data`, `loading` and `error` (like in the case of `useQuery` above)
  const [createPet, newPet] = useMutation(NEW_PET, {
    // NOTE: there are multiple ways of making sure our queries get updated after a mutation, one way is to manually update the cache (very much like writing a reducer in Redux!):
    update(cache, { data: { addPet } }) {
      const data = cache.readQuery({ query: ALL_PETS });
      cache.writeQuery({
        query: ALL_PETS,
        data: { pets: [addPet, ...data.pets] },
      });
    },
    // NOTE: this is one way we can utilize the optimistic UI provided by Apollo - or we can add it to the function that calls a mutation - it depends on the use case:
    // optimisticResponse: {},
  });

  const onSubmit = (input) => {
    setModal(false);
    createPet({
      // NOTE: we pass our Query Variables to this function to use and actually trigger a mutation - `newPet` here corresponds to `$newPet`:
      // NOTE: here `input` has been configured in the right format (it is something like: {"name": "batman", "type": "DOG"})
      variables: { newPet: input },
      // NOTE: this is one way we can utilize the optimistic UI provided by Apollo - or we can add it directly inside `useMutation` (see above) - it depends on the use case:
      optimisticResponse: {
        __typename: 'Mutation',
        addPet: {
          // NOTE: you can check the GraphQL Schema to get this (in this case `Pet`):
          __typename: 'Pet',
          // NOTE: we can't possibly know the id as we are creating, so we just create a random placeholder:
          id: Math.floor(Math.random() * 10000) + '',
          // NOTE: unlike `id`, we have access to these via `input` so we just pass them through:
          name: input.name,
          type: input.type,
          img: 'https://via.placeholder.com/300',
        },
      },
    });
  };

  // NOTE: this line is commented out as we are now using Optimistic UI and would not want to show the loading circle anymore!
  // if (loading || newPet.loading) {
  if (loading) {
    return <Loader />;
  }

  if (error || newPet.error) {
    return <p>Error!</p>;
  }

  console.log(data.pets[0]);

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
