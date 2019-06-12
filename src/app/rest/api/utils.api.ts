import { Response } from "@angular/http";

 /**
   *
   * Extends object by coping non-existing properties.
   * @param objA object to be extended
   * @param objB source object
   */
function extendObj<T1, T2>(objA: T1, objB: T2): T1 & T2 {
  for (let key in objB) {
    if (objB.hasOwnProperty(key)) {
      (<T1 & T2>objA)[key] = (<T1 & T2>objB)[key];
    }
  }
  return <T1 & T2>objA;
}

const handleResponse = (response: Response) => {
  if (response.status === 204) {
    return undefined;
  } else {
    return response.json();
  }
};

export {
  extendObj,
  handleResponse,
};
