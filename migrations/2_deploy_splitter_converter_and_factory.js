var SplitterConverter = artifacts.require('./SplitterConverter.sol')
var SplitterConverterFactory = artifacts.require('./SplitterConverterFactory.sol')

module.exports = (deployer) => {
  let splitterConverter, splitterConverterFactory

  console.log('Deploying SplitterConverter contract.')
  deployer.deploy(SplitterConverter).then(() => {
    splitterConverter = SplitterConverter.at(SplitterConverter.address)
    deployer.link(SplitterConverter, SplitterConverterFactory)
    console.log('Deploying SplitterConverterFactory contract.')
    return deployer.deploy(SplitterConverterFactory, splitterConverter.address)
  }).then(() => {
    splitterConverterFactory = SplitterConverterFactory.at(SplitterConverterFactory.address)
  })
}