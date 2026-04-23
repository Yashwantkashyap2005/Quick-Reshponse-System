import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  const [contacts, setContacts] = useState([
    { id: '1', name: 'Elena Rodriguez', phone: '+1 (555) 123-4567', relation: 'Spouse' },
    { id: '2', name: 'Dr. Marcus Thorne', phone: '+1 (555) 987-6543', relation: 'Physician' },
    { id: '3', name: 'James Wilson', phone: '+1 (555) 444-5566', relation: 'Neighbor' }
  ]);

  const login = (email, password) => {
    setUser({ email, name: email.split('@')[0] });
  };

  const signup = (name, email, password) => {
    setUser({ name, email });
  };

  const logout = () => {
    setUser(null);
  };

  const addContact = (name, phone, relation = 'Contact') => {
    const newContact = {
      id: Date.now().toString(),
      name,
      phone,
      relation
    };
    setContacts([...contacts, newContact]);
  };

  const deleteContact = (id) => {
    setContacts(contacts.filter(contact => contact.id !== id));
  };

  return (
    <AppContext.Provider value={{
      user,
      login,
      signup,
      logout,
      contacts,
      addContact,
      deleteContact
    }}>
      {children}
    </AppContext.Provider>
  );
};
