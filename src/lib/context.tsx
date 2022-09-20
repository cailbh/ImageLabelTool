import React, { useContext, useState } from 'react';
import { MemoArray, Relationship, RelationshipArray, EntityArray, Entity, Info } from './interface'
import { arrayBuffer } from 'stream/consumers';


const entityContext = React.createContext<EntityArray>({ array: [] });
const EntityUpdateContext = React.createContext(null);

export const useEntityArray = () => useContext(entityContext);
export const useEntityArrayUpdate = () => useContext(EntityUpdateContext);
export const EntityArrayContextProvider = ({ children }) => {
    const [entityArray, setEntityArray] = useState<Entity[]>([]);
    const updateEntityArray = (entityArray) => {
        setEntityArray([...entityArray])
    }
    return (
        <entityContext.Provider value={{ array: entityArray }}>
            <EntityUpdateContext.Provider value={updateEntityArray}>
                {children}
            </EntityUpdateContext.Provider>
        </entityContext.Provider>
    );
};

const relationshipContext = React.createContext<RelationshipArray>({ array: [] });
const relationshipUpdateContext = React.createContext(null);

export const useRelationshipArray = () => useContext(relationshipContext);
export const useRelationshipArrayUpdate = () => useContext(relationshipUpdateContext);
export const RelationshipArrayContextProvider = ({ children }) => {
    const [RelationshipArray, setRelationshipArray] = useState<Relationship[]>([]);
    const updateRelationshipArray = (RelationshipArray) => {
        setRelationshipArray([...RelationshipArray])
    }
    return (
        <relationshipContext.Provider value={{ array: RelationshipArray }}>
            <relationshipUpdateContext.Provider value={updateRelationshipArray}>
                {children}
            </relationshipUpdateContext.Provider>
        </relationshipContext.Provider>
    );
};


const memoContext = React.createContext<MemoArray>({ entArray: [], relArray: [] });
const memoUpdateContext = React.createContext(null);

export const useMemoArray = () => useContext(memoContext);
export const useMemoArrayUpdate = () => useContext(memoUpdateContext);
export const MemoArrayContextProvider = ({ children }) => {
    const [entArray, setEntArray] = useState<Entity[]>([]);
    const [relArray, setRelArray] = useState<Relationship[]>([]);
    const updateMemoArray = (entArray, relArray) => {
        setEntArray([...entArray])
        setRelArray([...relArray])
    }
    return (
        <memoContext.Provider value={{ entArray: entArray, relArray: relArray }}>
            <memoUpdateContext.Provider value={updateMemoArray}>
                {children}
            </memoUpdateContext.Provider>
        </memoContext.Provider>
    );
};

const infoContext = React.createContext<Info>(null);
const InfoUpdateContext = React.createContext(null);

export const useInfo = () => useContext(infoContext);
export const useInfoUpdate = () => useContext(InfoUpdateContext);
export const InfoContextProvider = ({ children }) => {
    const [info, setInfo] = useState<Info>();
    const updateInfo = (infoArray) => {
        setInfo(infoArray)
    }
    return (
        <infoContext.Provider value={info}>
            <InfoUpdateContext.Provider value={updateInfo}>
                {children}
            </InfoUpdateContext.Provider>
        </infoContext.Provider>
    );
};