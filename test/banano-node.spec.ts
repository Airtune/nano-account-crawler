import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as fetch from 'node-fetch';
import { NanoNode } from "../src/nano-node";
import { IStatusReturn } from '../src/status-return-interfaces';

chai.use(chaiAsPromised);
const expect = chai.expect;

const bananode = new NanoNode('http://145.239.223.42:7072', fetch);
const account = 'ban_3airtunegymgr6b8t9b8muh7upg39bcheahxqwkbtu96ux69pzn1idcu34wz';
const head = 'AC4C7C242703B72E73664D367685107E04C3A5FE91E95EC9147E8A3778BC6437';

describe('NanoNode using Banano Honey API', () => {
  it('getHistoryAfterHead', async () => {
    const accountHistoryStatusReturn: IStatusReturn<any> = await bananode.getForwardHistory(account, head, '1').catch((error) => { throw(error); });
    if (accountHistoryStatusReturn.status == "error") {
      throw(`Got error of type ${accountHistoryStatusReturn.error_type} in accountHistoryStatusReturn: ${accountHistoryStatusReturn.message}`);
    }
    const accountHistory = accountHistoryStatusReturn.value;
    expect(accountHistory).to.be.an('object').that.include.all.keys('account', 'history');
    expect(accountHistory.account).to.equal(account);
    expect(accountHistory.history[0].previous).to.equal(head);
  });
});
