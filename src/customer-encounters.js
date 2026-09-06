const unique=values=>[...new Set((values||[]).filter(Boolean))];

export function isNewCustomer(customer,state){
  return!!customer?.id&&!unique(state?.encounteredCustomers).includes(customer.id);
}

export function inferEncounteredCustomerIds(customers=[],globalReviews=[]){
  const reviewedNames=new Set((globalReviews||[]).map(review=>review?.customer).filter(Boolean));
  return unique(customers.filter(customer=>
    Number(customer?.visits||0)>0||
    (customer?.visitHistory||[]).length>0||
    (customer?.reviews||[]).length>0||
    reviewedNames.has(customer?.name)
  ).map(customer=>customer.id));
}

export function migrateEncounteredCustomerIds({customers=[],rawEncounteredCustomers=[],globalReviews=[],rebuildLegacy=false}={}){
  const validIds=new Set(customers.map(customer=>customer.id));
  const recorded=unique(rawEncounteredCustomers).filter(id=>validIds.has(id));
  const inferred=inferEncounteredCustomerIds(customers,globalReviews);
  const looksLikeLegacyAll=customers.length>0&&recorded.length>=customers.length&&inferred.length<customers.length;
  const preserved=rebuildLegacy&&looksLikeLegacyAll?[]:recorded;
  return unique([...preserved,...inferred]);
}

export function registerCustomerEncounter(state,customer){
  if(!state||!customer||!isNewCustomer(customer,state))return false;
  state.encounteredCustomers=unique([...(state.encounteredCustomers||[]),customer.id]);
  if(state.session)state.session.newCustomers=Number(state.session.newCustomers||0)+1;
  return true;
}
