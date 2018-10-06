var DeconetPaymentsSplitting = artifacts.require('./DeconetPaymentsSplitting.sol')
var DeconetPaymentsSplittingFactory = artifacts.require('./DeconetPaymentsSplittingFactory.sol')

module.exports = (deployer) => {
  let deconetPaymentsSplitting, deconetPaymentsSplittingFactory

  console.log('Deploying DeconetPaymentsSplitting contract.')
  deployer.deploy(DeconetPaymentsSplitting).then(() => {
    deconetPaymentsSplitting = DeconetPaymentsSplitting.at(DeconetPaymentsSplitting.address)
    deployer.link(DeconetPaymentsSplitting, DeconetPaymentsSplittingFactory)
    console.log('Deploying DeconetPaymentsSplittingFactory contract.')
    return deployer.deploy(DeconetPaymentsSplittingFactory, deconetPaymentsSplitting.address)
  }).then(() => {
    deconetPaymentsSplittingFactory = DeconetPaymentsSplittingFactory.at(DeconetPaymentsSplittingFactory.address)
  })
}